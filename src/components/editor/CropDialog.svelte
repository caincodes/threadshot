<script lang="ts">
  import { untrack } from "svelte";

  import { editor, NO_CROP, type MediaCrop } from "../../lib/editor.svelte";
  import CroppedImage from "../thread/media/CroppedImage.svelte";

  const MAX_ZOOM = 4;

  let {
    target,
  }: { target: { key: string; src: string; aspect: number } } = $props();

  // Changes stay in a draft until Done, so Cancel leaves the preview alone.
  // The dialog is rebuilt for each picture, so reading the target once is enough.
  let crop = $state<MediaCrop>(
    untrack(() => ({ ...(editor.mediaCrops[target.key] ?? NO_CROP) }))
  );
  let frame = $state<HTMLDivElement>();
  let natural = { width: 0, height: 0 };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const setZoom = (zoom: number) => {
    crop.zoom = clamp(zoom, 1, MAX_ZOOM);
  };

  // How far the zoomed picture reaches past its frame, in screen pixels. The
  // focus point moves across that whole distance as it goes from 0 to 100%.
  const overflow = () => {
    if (!frame || !natural.width || !natural.height) {
      return { x: 0, y: 0 };
    }
    const { clientWidth: width, clientHeight: height } = frame;
    const scale =
      Math.max(width / natural.width, height / natural.height) * crop.zoom;
    return {
      x: natural.width * scale - width,
      y: natural.height * scale - height,
    };
  };

  // One finger or the mouse drags the picture; two fingers pinch to zoom.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- only read by the handlers
  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: { distance: number; zoom: number } | null = null;

  const pinchDistance = () => {
    const [first, second] = [...pointers.values()];
    return Math.hypot(first.x - second.x, first.y - second.y);
  };

  const onPointerDown = (event: PointerEvent & { currentTarget: HTMLElement }) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      pinch = { distance: pinchDistance(), zoom: crop.zoom };
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    const last = pointers.get(event.pointerId);
    if (!last) {
      return;
    }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size === 2) {
      setZoom((pinch.zoom * pinchDistance()) / pinch.distance);
      return;
    }
    const reach = overflow();
    if (reach.x > 0) {
      crop.x = clamp(crop.x - ((event.clientX - last.x) / reach.x) * 100, 0, 100);
    }
    if (reach.y > 0) {
      crop.y = clamp(crop.y - ((event.clientY - last.y) / reach.y) * 100, 0, 100);
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    pinch = null;
  };

  // Registered by hand because the page must not scroll while zooming.
  const wheelZoom = (node: HTMLElement) => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom(crop.zoom * Math.exp(-event.deltaY / 300));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  };

  const close = () => {
    editor.cropping = null;
  };

  const done = () => {
    editor.setCrop(target.key, $state.snapshot(crop));
    close();
  };
</script>

<dialog
  {@attach (dialog) => dialog.showModal()}
  class="m-auto w-[min(100%-2rem,480px)] max-w-none bg-white p-4 backdrop:bg-ink/60"
  aria-label="Crop picture"
  onclose={close}
>
  <div class="flex flex-col gap-4">
    <h2 class="heading text-xl">Crop picture</h2>
    <div
      bind:this={frame}
      class="mx-auto w-full cursor-grab touch-none overflow-hidden bg-canvas select-none active:cursor-grabbing"
      style:aspect-ratio={target.aspect}
      style:max-width="calc(60dvh * {target.aspect})"
      aria-label="Crop area"
      role="application"
      {@attach wheelZoom}
      onpointercancel={onPointerUp}
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
    >
      <CroppedImage
        class="pointer-events-none size-full"
        alt="Picture being cropped"
        {crop}
        onload={(image) => {
          natural = { width: image.naturalWidth, height: image.naturalHeight };
        }}
        src={target.src}
      />
    </div>
    <p class="text-sm text-ink-2">
      Drag to move the picture. Pinch, scroll or use the slider to zoom.
    </p>
    <label class="option-row">
      <span class="text-sm">Zoom</span>
      <input
        class="w-44 accent-accent"
        max={MAX_ZOOM}
        min={1}
        oninput={(event) => setZoom(event.currentTarget.valueAsNumber)}
        step={0.01}
        type="range"
        value={crop.zoom}
      />
    </label>
    <div class="grid grid-cols-3 gap-2">
      <button
        class="btn btn-secondary px-2"
        onclick={() => (crop = { ...NO_CROP })}
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
