<script lang="ts">
  import { untrack } from "svelte";

  import { editor } from "../../lib/editor.svelte";

  // The smallest crop, as a fraction of the picture's width or height.
  const MIN_SIZE = 0.05;
  const WHOLE = { x: 0, y: 0, width: 1, height: 1 };

  type Rect = typeof WHOLE;
  type Edge = "top" | "right" | "bottom" | "left";

  let { target }: { target: { key: string; src: string } } = $props();

  // Changes stay in a draft until Done, so Cancel leaves the preview alone.
  // The dialog is rebuilt for each picture, so reading the target once is enough.
  let rect = $state<Rect>(
    untrack(() => {
      const saved = editor.mediaCrops[target.key];
      return saved
        ? { x: saved.x, y: saved.y, width: saved.width, height: saved.height }
        : { ...WHOLE };
    })
  );
  let picture = $state<HTMLDivElement>();
  let natural = $state({ width: 0, height: 0 });

  const pixels = $derived({
    width: Math.round(rect.width * natural.width),
    height: Math.round(rect.height * natural.height),
  });

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  // Pointer positions as fractions of the picture shown in the dialog.
  const pointAt = (event: PointerEvent) => {
    const box = picture!.getBoundingClientRect();
    return {
      x: clamp((event.clientX - box.left) / box.width, 0, 1),
      y: clamp((event.clientY - box.top) / box.height, 0, 1),
    };
  };

  // Dragging inside the crop moves it, dragging a handle moves those edges,
  // and dragging anywhere else on the picture draws a new crop.
  let drag:
    | { kind: "move"; from: { x: number; y: number }; start: Rect }
    | { kind: "resize"; edges: Edge[]; start: Rect }
    | { kind: "draw"; anchor: { x: number; y: number } }
    | null = null;

  const begin = (event: PointerEvent, next: NonNullable<typeof drag>) => {
    event.stopPropagation();
    picture!.setPointerCapture(event.pointerId);
    drag = next;
  };

  const resize = (start: Rect, edges: Edge[], point: { x: number; y: number }) => {
    let { x: left, y: top } = start;
    let right = start.x + start.width;
    let bottom = start.y + start.height;
    if (edges.includes("left")) {
      left = Math.min(point.x, right - MIN_SIZE);
    }
    if (edges.includes("right")) {
      right = Math.max(point.x, left + MIN_SIZE);
    }
    if (edges.includes("top")) {
      top = Math.min(point.y, bottom - MIN_SIZE);
    }
    if (edges.includes("bottom")) {
      bottom = Math.max(point.y, top + MIN_SIZE);
    }
    return { x: left, y: top, width: right - left, height: bottom - top };
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag) {
      return;
    }
    const point = pointAt(event);
    if (drag.kind === "move") {
      const { start, from } = drag;
      rect = {
        ...start,
        x: clamp(start.x + point.x - from.x, 0, 1 - start.width),
        y: clamp(start.y + point.y - from.y, 0, 1 - start.height),
      };
    } else if (drag.kind === "resize") {
      rect = resize(drag.start, drag.edges, point);
    } else {
      const { anchor } = drag;
      rect = {
        x: Math.min(anchor.x, point.x),
        y: Math.min(anchor.y, point.y),
        width: Math.abs(point.x - anchor.x),
        height: Math.abs(point.y - anchor.y),
      };
    }
  };

  // A tap that draws nothing would leave a crop too small to grab.
  const onPointerUp = () => {
    if (drag?.kind === "draw" && (rect.width < MIN_SIZE || rect.height < MIN_SIZE)) {
      rect = { ...WHOLE };
    }
    drag = null;
  };

  const handles: { edges: Edge[]; class: string; cursor: string }[] = [
    { edges: ["top", "left"], class: "top-0 left-0", cursor: "nwse-resize" },
    { edges: ["top", "right"], class: "top-0 left-full", cursor: "nesw-resize" },
    { edges: ["bottom", "left"], class: "top-full left-0", cursor: "nesw-resize" },
    { edges: ["bottom", "right"], class: "top-full left-full", cursor: "nwse-resize" },
    { edges: ["top"], class: "top-0 left-1/2", cursor: "ns-resize" },
    { edges: ["bottom"], class: "top-full left-1/2", cursor: "ns-resize" },
    { edges: ["left"], class: "top-1/2 left-0", cursor: "ew-resize" },
    { edges: ["right"], class: "top-1/2 left-full", cursor: "ew-resize" },
  ];

  const close = () => {
    editor.cropping = null;
  };

  const done = () => {
    editor.setCrop(target.key, {
      ...$state.snapshot(rect),
      aspect: pixels.height ? pixels.width / pixels.height : 1,
    });
    close();
  };
</script>

<dialog
  {@attach (dialog) => dialog.showModal()}
  class="m-auto w-[min(100%-2rem,560px)] max-w-none bg-white p-4 backdrop:bg-ink/60"
  aria-label="Crop picture"
  onclose={close}
>
  <div class="flex flex-col gap-4">
    <h2 class="heading text-xl">Crop picture</h2>
    <div class="flex justify-center bg-canvas p-3">
      <!-- Sized by the picture, so fractions of this box are fractions of it. -->
      <div
        bind:this={picture}
        class="relative cursor-crosshair touch-none select-none"
        aria-label="Crop area"
        onlostpointercapture={onPointerUp}
        onpointerdown={(event) =>
          begin(event, { kind: "draw", anchor: pointAt(event) })}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        role="application"
      >
        <img
          class="pointer-events-none block max-h-[60dvh] max-w-full"
          alt=""
          draggable="false"
          onload={(event) => {
            const image = event.currentTarget as HTMLImageElement;
            natural = { width: image.naturalWidth, height: image.naturalHeight };
          }}
          src={target.src}
        />
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            class="absolute shadow-[0_0_0_9999px_rgb(0_0_0/0.55)]"
            style:left="{rect.x * 100}%"
            style:top="{rect.y * 100}%"
            style:width="{rect.width * 100}%"
            style:height="{rect.height * 100}%"
          ></div>
        </div>
        <div
          class="absolute cursor-move outline-2 outline-white"
          style:left="{rect.x * 100}%"
          style:top="{rect.y * 100}%"
          style:width="{rect.width * 100}%"
          style:height="{rect.height * 100}%"
          onpointerdown={(event) => {
            // A crop of the whole picture can't move, so dragging draws instead.
            if (rect.width < 1 || rect.height < 1) {
              begin(event, {
                kind: "move",
                from: pointAt(event),
                start: { ...rect },
              });
            }
          }}
          role="presentation"
        >
          <!-- Thirds, to help line the crop up. -->
          <div
            class="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 *:border-white/40 [&>:nth-child(-n+6)]:border-b [&>:not(:nth-child(3n))]:border-r"
          >
            {#each { length: 9 }, cell (cell)}
              <div></div>
            {/each}
          </div>
          {#each handles as handle (handle.edges.join())}
            <div
              class={[
                "absolute flex size-8 -translate-1/2 items-center justify-center",
                handle.class,
              ]}
              style:cursor={handle.cursor}
              onpointerdown={(event) =>
                begin(event, {
                  kind: "resize",
                  edges: handle.edges,
                  start: { ...rect },
                })}
              role="presentation"
            >
              <span class="size-3 rounded-full border-2 border-accent bg-white"></span>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <p class="flex justify-between gap-2 text-sm text-ink-2">
      <span>Drag the corners or edges, or draw a new crop.</span>
      {#if natural.width}
        <span class="shrink-0 tabular-nums">{pixels.width} × {pixels.height}</span>
      {/if}
    </p>
    <div class="grid grid-cols-3 gap-2">
      <button
        class="btn btn-secondary px-2"
        onclick={() => (rect = { ...WHOLE })}
        type="button"
      >
        Reset
      </button>
      <button class="btn btn-secondary px-2" onclick={close} type="button">
        Cancel
      </button>
      <button class="btn btn-primary px-2" onclick={done} type="button">
        Done
      </button>
    </div>
  </div>
</dialog>
