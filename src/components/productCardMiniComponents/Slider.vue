<template>
  <div class="scrollable-gallery-wrapper">
    <div
      ref="scrollContainer"
      class="scroll-container"
      :class="{ 'is-dragging': isDragging }"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <div class="gallery-track">
        <div
          v-for="(image, index) in processedImages"
          :key="image.key || index"
          class="gallery-item"
          @click="handleItemClick(image.src)"
        >
          <img
            loading="lazy"
            draggable="false"
            :alt="`${name} - Image ${index + 1}`"
            :src="image.src"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import placeHolderImage from "@assets/images/placeholder.jpg";
import { getImageSrc } from "@/js/utils.js";

const props = defineProps({
  name: String,
  carouselImages: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['image-click']);

const fallbackImageSrc = placeHolderImage.src || placeHolderImage;
const scrollContainer = ref(null);

// Drag State (Mouse only; Touch uses native scrolling)
const isMouseDown = ref(false);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeftStart = ref(0);

const processedImages = computed(() => {
  if (!Array.isArray(props.carouselImages) || props.carouselImages.length === 0) {
    return [{ src: fallbackImageSrc, key: 'fallback-0' }];
  }
  return props.carouselImages.map((img, index) => ({
    src: getImageSrc(img) || fallbackImageSrc,
    key: img?.id || `gallery-item-${index}`
  }));
});

function onMouseDown(event) {
  if (!scrollContainer.value) return;
  isMouseDown.value = true;
  isDragging.value = false;
  startX.value = event.pageX - scrollContainer.value.offsetLeft;
  scrollLeftStart.value = scrollContainer.value.scrollLeft;
}

function onMouseMove(event) {
  if (!isMouseDown.value || !scrollContainer.value) return;
  const x = event.pageX - scrollContainer.value.offsetLeft;
  const walk = (x - startX.value) * 1.2;

  if (Math.abs(walk) > 6) {
    isDragging.value = true;
  }
  scrollContainer.value.scrollLeft = scrollLeftStart.value - walk;
}

function onMouseUp() {
  isMouseDown.value = false;
  setTimeout(() => {
    isDragging.value = false;
  }, 50);
}

function handleItemClick(src) {
  if (isDragging.value) return;
  emit('image-click', src);
}
</script>

<style lang="less" scoped>
.scrollable-gallery-wrapper {
  position: relative;
  width: 100%;
}

.scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  user-select: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &.is-dragging {
    cursor: grabbing;
    scroll-behavior: auto;
  }
}

.gallery-track {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  gap: 12px;
  min-width: 100%;
}

.gallery-item {
  flex-shrink: 0;
  height: 160px;
  width: auto;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background-color: #eee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
}

body.dark-mode {
  .gallery-item {
    background-color: #333;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);

    &:hover {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    }
  }
}
</style>