import { snap } from "@popmotion/popcorn";
import { useGesture } from "@use-gesture/react";
import { cx } from "class-variance-authority";
import { type MotionValue, useAnimationFrame, useSpring, motion, useTransform, interpolate, wrap } from "framer-motion";
import { useControls } from "leva";
import { type RefObject, useRef, useState, memo } from "react";

import { useMediaQuery } from "~/features/dom/hooks/use-media-query";
import { up } from "~/features/dom/utils/screens";

import { useDisableOverscroll } from "./hooks/use-disable-overscroll";
import { calculateOverlap, setMotionValue } from "./utils";

type OptionItem = {
  itemWidth: number;
  itemGap: number;
  itemsScale: { lg: number; md: number; sm: number };
};

type Item = (typeof ITEMS)[0] & { index: number };

type ItemProps = {
  id: number;
  index: number;
  offsetValue: MotionValue<number>;
  containerRef: RefObject<HTMLDivElement>;
  currentOptions: OptionItem;
  debug?: boolean;
};

const Options: { breakpoint: { md: OptionItem; sm: OptionItem } } = {
  breakpoint: {
    md: {
      itemWidth: 400, // Actual size of the item
      itemGap: 32,
      // how much item will scale when it's one and two positions away from the center
      itemsScale: { lg: 1, md: 0.8, sm: 0.6 },
    },
    sm: {
      itemWidth: 280,
      itemGap: 16,
      itemsScale: { lg: 0.8, md: 0.6, sm: 0.6 },
    },
  },
};

const ITEMS = [...Array(1000)].map((_, i) => ({
  id: i + 1,
}));

export const Carousel = () => {
  const { debug } = useControls("Settings", {
    debug: false,
  });
  useDisableOverscroll();

  const containerRef = useRef<HTMLDivElement>(null);

  // Items are virtualized to ensure good performance even with a large number of items
  const [virtualItems, setVirtualItems] = useState<Item[]>([]);

  // Main spring value that controls the carousel movement
  const offsetXValue = useSpring(0, { stiffness: 300, damping: 50, mass: 1 });

  const isMdUp = useMediaQuery(up("md"));
  const breakpointOptions = Options.breakpoint[isMdUp ? "md" : "sm"];

  // Zoom out UI on debug mode, to visualize adding and removal of items
  const currentOptions = !debug
    ? breakpointOptions
    : {
        itemWidth: breakpointOptions.itemWidth / 2,
        itemGap: breakpointOptions.itemGap / 2,
        itemsScale: breakpointOptions.itemsScale,
      };

  // Update the current virtualized items based on the current offset
  // runs on every frame
  const updateVirtualizedItems = () => {
    if (!containerRef.current) return;

    const _currentXOffset = offsetXValue.get();

    const containerWidth = containerRef.current.offsetWidth;

    // Get the minimum possible width of an item with the gap
    // Items are rendered inside a container with the min width, so we use that as the base width for calculations
    const minItemWidthWithGap = currentOptions.itemWidth * currentOptions.itemsScale.sm + currentOptions.itemGap;

    // Calculate the index of the first item that should be visible
    const startIndex = Math.floor(-_currentXOffset / minItemWidthWithGap);

    // Calculate the minimum number of items required to fill the container, and the last item index based on that
    // Items always need to be odd to have an item to center on the screen
    const _minItemsRequired = Math.ceil(containerWidth / minItemWidthWithGap) + 1;
    const minItemsRequired = _minItemsRequired % 2 === 0 ? _minItemsRequired + 1 : _minItemsRequired;
    const endIndex = startIndex + minItemsRequired;

    const _virtualItems: Item[] = [];

    // Populate the virtual items array with the items that should be visible
    // restart from the beginning/end of the base items array if we reach the end/beginning
    for (let i = startIndex; i < endIndex; i++) {
      _virtualItems.push({ ...ITEMS[wrap(0, ITEMS.length, i)]!, index: i });
    }

    setVirtualItems((prev) => {
      // Only update state if the items changed, to avoid unnecessary re-renders
      if (prev.length !== 0 && prev.every((item, index) => item.id === _virtualItems[index]?.id)) return prev;
      return _virtualItems;
    });
  };

  const currentXOffset = useRef<number>(0);
  const wheelOffset = useRef<number>(0);
  const dragOffset = useRef<number>(0);

  // Refs to keep track of the state of the carousel
  const isFirstLoop = useRef(true);
  const userInteraction = useRef(false);
  const isSnapping = useRef(false);
  const prevContainerWidth = useRef<number | null>(null);

  // Update spring value on animation frame to avoid jank
  useAnimationFrame(() => {
    const loop = () => {
      if (!containerRef.current) return;

      const itemWidthWithGap = currentOptions.itemWidth * currentOptions.itemsScale.sm + currentOptions.itemGap;

      // Calculate the additional offset needed to center the items
      const containerWidth = containerRef.current.offsetWidth;
      const itemsWidth = virtualItems.length * itemWidthWithGap - currentOptions.itemGap; // Remove the last gap
      const centerOffset = (containerWidth - itemsWidth) / 2;

      // Check if we are currently resizing the window/container
      const isResizing = prevContainerWidth.current !== null && prevContainerWidth.current !== containerWidth;

      // User interacts with the carousel, drag or scroll
      if (userInteraction.current) {
        if (debug) console.log("DEBUG: User Interaction");
        isSnapping.current = false;
        setMotionValue(offsetXValue, currentXOffset.current + centerOffset);
      }
      // Carousel is idle, in this state we handle items snapping and window/container resizing
      else {
        // If the carousel is not resizing, we snap the items to the center
        if (!isResizing) {
          // Avoid snapping multiple times
          if (isSnapping.current) return;
          if (debug) console.log("DEBUG: Snapping");
          isSnapping.current = true;
        }

        if (isResizing && debug) console.log("DEBUG: Window Resizing");

        const distance = snap(itemWidthWithGap)(currentXOffset.current);
        setMotionValue(offsetXValue, distance + centerOffset, isFirstLoop.current || isResizing);

        // Show items only when everything is ready and the items are in place
        containerRef.current.style.setProperty("visibility", "visible");
      }

      isFirstLoop.current = false;
      prevContainerWidth.current = containerRef.current.offsetWidth;
    };

    // Wait for media query to be ready
    if (isMdUp === undefined) return;

    // Initialize items for first time if there are no items yet
    // Start loop only when items are ready
    const itemsReady = virtualItems.length > 0;
    if (itemsReady) loop();

    updateVirtualizedItems();
  });

  const bindGestures = useGesture(
    {
      onDrag: ({ offset: [x], direction: [dx], dragging }) => {
        if (!dx) return;

        // We use wheelOffset on drag and viceversa to sync the two gestures when switching between them
        userInteraction.current = dragging || false;
        dragOffset.current = x;
        currentXOffset.current = wheelOffset.current + x;
      },
      onDragEnd: () => {
        userInteraction.current = false;
      },
      onWheel: ({ offset: [, y], direction: [, dy], wheeling }) => {
        if (!dy) return;

        userInteraction.current = wheeling || false;
        wheelOffset.current = y;
        currentXOffset.current = dragOffset.current + y;
      },
    },
    { drag: { delay: true } }
  );

  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden">
      <div className={cx("w-full h-full bg-[#f6f6f6] flex items-center", debug && "w-[50%] h-[50%]")}>
        <div
          className={cx("relative grid w-full touch-none", debug && "outline-dashed outline-black/30")}
          ref={containerRef}
          style={{ visibility: "hidden" }}
          {...bindGestures()}
        >
          {virtualItems.map((item) => (
            <Item
              key={item.index}
              id={item.id}
              index={item.index}
              offsetValue={offsetXValue}
              containerRef={containerRef}
              currentOptions={currentOptions}
              debug={debug}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Item = memo(({ id, index, offsetValue, containerRef, currentOptions, debug }: ItemProps) => {
  // Items are rendered inside a container with the min width, so we use that as the base width for calculations
  const minItemWidth = currentOptions.itemWidth * currentOptions.itemsScale.sm;
  const minItemWidthWithGap = minItemWidth + currentOptions.itemGap;

  // Calculate the position of each item based on the index
  const itemOffset = useTransform(offsetValue, (_offsetValue) => {
    return _offsetValue + index * minItemWidthWithGap;
  });

  // Calculate the distance of the item to the center of the container
  const distanceToCenter = useTransform(itemOffset, (_itemOffset) => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    return _itemOffset - containerWidth / 2 + minItemWidth / 2;
  });

  // Interpolate the scale of the item based on the distance to the center
  const scale = useTransform(() => {
    return interpolate(
      [0, minItemWidthWithGap, minItemWidthWithGap * 2],
      [currentOptions.itemsScale.lg, currentOptions.itemsScale.md, currentOptions.itemsScale.sm]
    )(Math.abs(distanceToCenter.get()));
  });

  // In the carousel we use the min width of the item as the base width of the items,
  // items are then scaled up when they are one and two positions away from the center.
  // This creates overlap between items, so we add a spacer to compensate for it
  const spacerXOffset = useTransform(() => {
    // Define the distance between items when they are one and two positions away from the center
    const itemsDistance1 = minItemWidthWithGap;
    const itemsDistance2 = minItemWidthWithGap * 2;

    // Calculate the overlap between items when they are one and two positions away from the center
    // then add gap to have the final offset betwwen items
    const overlap1 = calculateOverlap(
      currentOptions.itemWidth * currentOptions.itemsScale.md,
      currentOptions.itemWidth * currentOptions.itemsScale.lg,
      minItemWidth
    );
    const overlap2 =
      calculateOverlap(
        currentOptions.itemWidth * currentOptions.itemsScale.sm,
        currentOptions.itemWidth * currentOptions.itemsScale.md,
        minItemWidth
      ) + overlap1;

    // Interpolate the offset based on the distance to the center
    const offset = interpolate(
      [-itemsDistance2, -itemsDistance1, 0, itemsDistance1, itemsDistance2],
      [-overlap2, -overlap1, 0, overlap1, overlap2]
    )(distanceToCenter.get());

    return itemOffset.get() + offset;
  });

  return (
    <motion.div
      className={cx(
        "relative col-start-1 row-start-1 will-change-transform flex justify-center select-none",
        debug && "outline outline-bg-black"
      )}
      style={{ x: spacerXOffset, width: minItemWidth }}
    >
      <motion.div
        className={cx(
          "relative rounded-[16px] origin-center shrink-0 aspect-[3/4] flex justify-center items-center bg-[#DBDBF3]",
          debug && "opacity-50"
        )}
        style={{ scale, width: currentOptions.itemWidth }}
      >
        <span className="font-sans font-light text-[32px] lg:text-[40px] text-[#A5A5C9]">{id}</span>
      </motion.div>
    </motion.div>
  );
});

Item.displayName = "Item";
