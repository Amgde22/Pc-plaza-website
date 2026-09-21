<template>
  <div class="product-card" @click="openDialog">
    <!-- In Stock Pill for Card - Absolute Positioned -->
    <span class="in-stock-pill in-stock-pill--card" :class="stockStatus.class" v-if="stockStatus">
      {{ t(stockStatus.text) }}
    </span>

    <!-- Show loading state or placeholder while image loads -->
    <div v-if="isLoading" class="product-image">
      <sl-spinner style="font-size: 3rem; --track-width: 5px;"></sl-spinner>
    </div>

    <div v-else class="product-image-container">
      <img 
        loading="lazy"
        :src="mainImageSrc" 
        :alt="name + ' image'" 
        class="product-image"
        @error="handleImageError" 
      /> 
      <img 
        loading="lazy"
        :src="mainImageSrc" 
        :alt="name + ' image'" 
        class="product-image-background"
        @error="handleImageError" 
      /> 
    </div>

    <p class="product-name">{{ name }}</p>

    <div class="product-tags">
      <p v-for="tag in tags" :key="tag" class="tag">{{ t(`products.tags.${tag}`) }}</p>
    </div>

    <p class="product-description">{{ description }}</p>

    <div class="product-price-and-button bottom-section">
      <span class="product-price">
        {{ formattedPrice }}
        <span class="product-offer-price">{{ formattedPromotionPrice }}</span>
      </span>
      
      <div class="learn-more-wrapper">
        <span class="learn-more-text">{{ t('products.learn_more') }}</span>
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7l-7 7" />
        </svg>
      </div>
    </div>
  </div>

  <!-- Main Product Dialog -->
  <dialog 
    @close="unlock"
    ref="dialog" 
    :class="['product-dialog', { modalVisible: modalVisible }]"
  >
    <div class="dialog-content">
      <!-- Close Dialog Button -->
      <button class="close-button" @click="closeDialog">
        <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g fill="none" fill-rule="evenodd">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
            <path fill="currentColor" d="m12 14.122l5.303 5.303a1.5 1.5 0 0 0 2.122-2.122L14.12 12l5.304-5.303a1.5 1.5 0 1 0-2.122-2.121L12 9.879L6.697 4.576a1.5 1.5 0 1 0-2.122 2.12L9.88 12l-5.304 5.304a1.5 1.5 0 1 0 2.122 2.12z" />
          </g>
        </svg>
      </button>

      <!-- Product Carousel / Slider -->
      <div class="carousel-container">
        <div v-if="!hasCarouselImages && isLoading" class="product-image">
          <sl-spinner style="font-size: 3rem; --track-width: 5px;"></sl-spinner>
        </div>
        
        <Slider 
          v-else-if="true"
          :name="name"
          :carousel-images="carouselImages"
          @image-click="openZoomModal"
        />

        <Carousel
          v-else
          :name="name"
          :carousel-images="carouselImages"
        />
      </div>

      <!-- Product Information -->
      <div class="dialog-product-informarion-container">
        <h3 class="dialog-product-name product-name">{{ name }}</h3>
        <span class="in-stock-pill in-stock-pill--modal" :class="stockStatus.class" v-if="stockStatus">
          {{ stockStatus.text }}
        </span>
        <p class="dialog-product-description custom-scrollbar"> 
          <slot name="description">
            {{ description }}
          </slot>
        </p>

        <div class="footer bottom-section">
          <span class="product-price">
            {{ formattedPrice }}
            <span class="product-offer-price">{{ formattedPromotionPrice }}</span>
          </span>

          <div class="icon-container">
            <a class="dialog-link whatsapp-icon-holder" :href="whatsappLink" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path><path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path><path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path><path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path><path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
              </svg>
            </a>
            <a class="dialog-link location-icon-holder" :href="googleMapsLink" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </dialog>

  <!-- Zoom Dialog (Sibling at Top Layer level) -->
  <dialog 
    ref="zoomDialog" 
    class="image-modal" 
    @click.self="closeZoomModal"
  >
    <span class="close" @click="closeZoomModal" aria-label="Close zoom view">&times;</span>
    <div class="modal-content-wrapper" @click.self="closeZoomModal">
      <img class="image-modal-content" :src="zoomedImageSrc" :alt="name + ' image preview'" />
    </div>
  </dialog>
</template>

<script setup>
/* ==========================================================================
   Imports
   ========================================================================== */
import { ref, computed, watch, onMounted, toValue } from 'vue';
import { lock, unlock } from 'tua-body-scroll-lock';
import useT from "@js/useT";

import placeHolderImage from "@assets/images/placeholder.jpg";
import data from "@data/client.json";
import Carousel from "@components/productCardMiniComponents/Carousel.vue";
import Slider from "@components/productCardMiniComponents/Slider.vue";

const googleMapsLink = data.address.mapLink;

/* ==========================================================================
   Prop Definitions
   ========================================================================== */
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  productImages: {
    type: Object,
    default: () => ({})
  },
  slider: {
    type: Boolean,
    required: false
  },
  // Language passed from Astro (SSR can't read document.documentElement).
  lang: {
    type: String,
    default: "ar"
  }
});

/* ==========================================================================
   Reactive State
   ========================================================================== */
const { t } = useT("", props.lang);

const modalVisible = ref(false);
const isLoading = ref(!props.productImages?.image?.src);
const hasImageError = ref(false);
const fallbackImageSrc = placeHolderImage.src;
const mainImageSrc = ref(placeHolderImage.src);
const isFallbackImage = ref(false);
const carouselImages = ref([]);

const dialog = ref(null);
const zoomDialog = ref(null);
const zoomedImageSrc = ref(fallbackImageSrc);

const { name, description, price, offer: offerPrice, tags: optionalProductTags, in_stock } = props.product?.data || {};

/* ==========================================================================
   Computed Properties
   ========================================================================== */
const hasCarouselImages = computed(() => carouselImages.value.length > 0);

const whatsappLink = computed(() => {
  const message = `لدي استفسار حول \n ${toValue(name)} \n`;
  const encodedMessage = encodeURIComponent(message);
  const separator = data.whatsappLink.includes('?') ? '&' : '?';
  return `${data.whatsappLink}${separator}text=${encodedMessage}`;
});

const tags = computed(() => {
  if (!Array.isArray(optionalProductTags)) return [];
  return Array.from(optionalProductTags);
});

const formatCurrency = (value, currency = t('dzd'), locale = 'en-US') => {
  if (value === null || value === undefined) return null;
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return null;
  return `${Math.round(numericValue).toLocaleString(locale)} ${currency}`;
};

const formattedPrice = computed(() => formatCurrency(price) || "Price unavailable");
const formattedPromotionPrice = computed(() => formatCurrency(offerPrice) || "");

const stockStatus = computed(() => {
  if (in_stock === true) {
    return { text: 'En stock', class: 'in-stock-pill--in' };
  } else if (in_stock === false) {
    return { text: 'Hors stock', class: 'in-stock-pill--out' };
  }
  return null;
});

/* ==========================================================================
   Methods
   ========================================================================== */
function handleImageUpdate(optimizedImages) {
  const optimized_mainImage = optimizedImages?.image;

  if (optimizedImages && optimized_mainImage && optimized_mainImage.src) {
    mainImageSrc.value = optimized_mainImage.src;
    isLoading.value = false;
    isFallbackImage.value = false;
  } else {
    isLoading.value = true;
    isFallbackImage.value = true;
    // setTimeout is a browser-only side effect; never schedule it during SSR.
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (isLoading.value) {
          mainImageSrc.value = fallbackImageSrc;
          isLoading.value = false;
        }
      }, 3000);
    }
  }
  updateCarouselImages(optimizedImages);
}

function updateCarouselImages(optimizedImages) { 
  if (!optimizedImages) return;
  carouselImages.value = [
    optimizedImages.image, 
    ...(optimizedImages.images || [])
  ].filter(Boolean);
}

function handleImageError() {
  hasImageError.value = true;
  mainImageSrc.value = fallbackImageSrc;
  isLoading.value = false;
  isFallbackImage.value = true;
}

const openDialog = () => {
  dialog.value.showModal();
  modalVisible.value = true;
  lock(dialog.value);
};

const closeDialog = () => {
  modalVisible.value = false;
  setTimeout(() => {
    unlock(dialog.value);
    dialog.value.close();
  }, 100);
};

const openZoomModal = (src) => {
  if (!src) return;
  zoomedImageSrc.value = src;
  zoomDialog.value.showModal();
};

const closeZoomModal = () => {
  zoomDialog.value.close();
};

/* ==========================================================================
   Watchers & Lifecycle
   ========================================================================== */
watch(() => props.productImages, (optimizedImages) => {
  if (!optimizedImages?.image) return;
  handleImageUpdate(optimizedImages);
}, { immediate: true, deep: true });

onMounted(() => {
  handleImageUpdate(props.productImages);
});
</script>

<style lang="less">
@shadow-color: rgba(0, 0, 0, 0.2);
@border-radius: 0.5rem;
@golden-color: #ffc107;
@text-color: #333;

:root {
  --success: #28a745;
  --danger: #dc3545;
}

/* ==========================================================================
   Product Card Styles (.product-card)
   ========================================================================== */
.product-card {
  font-size: 0.8em;
  background-color: white;
  border-radius: @border-radius;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    border-color: var(--primary);

    .learn-more-text {
      color: var(--primary);
    }
    .icon {
      transform: translateX(4px);
    }
  }
}

.product-image-container {
  position: relative;
  max-height: 200px;
  border-radius: @border-radius;
  aspect-ratio: 16/9;
  isolation: isolate;
  overflow: hidden;
  margin-bottom: 1.25rem;
  background-color: #f8f9fa;

  .product-image-background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(10px);
    transform: scale(1.1);
    z-index: -1;
  }

  .product-image {
    height: 90%;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  }
}

.product-image {
  height: 100%;
  display: block;
  margin: auto;
  margin-bottom: 0.75rem;
  object-fit: contain;
  z-index: 1;
}

.product-name {
  color: var(--headerColor);
  text-transform: capitalize;
  font-weight: bold;
  font-size: 1.25em;
  margin-bottom: auto;
}

.product-tags {
  display: flex;
  margin-bottom: 1rem;
  gap: 6px;
  flex-wrap: wrap;

  & .tag {
    font-size: 0.9em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 10px;
    border-radius: 6px;
    background-color: transparent;
    border: 1.5px solid var(--primary);
    color: var(--primary);
    opacity: 0.85;
  }
}

.product-description {
  font-size: 1.1em;
  color: @text-color;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  overflow: hidden;
  max-height: 3.8em;
  font-weight: 400;
}

.product-price-and-button {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: clamp(19px, 16.21px + 0.99vw, 24px);
  display: flex;
  flex-direction: column;
  font-weight: 800;
  line-height: 1.1;
  color: var(--headerColor);

  .product-offer-price {
    font-size: 0.75em;
    font-weight: 500;
    color: #888;
    text-decoration: line-through;
    opacity: 0.7;
    margin-top: 2px;

    &:empty {
      display: none;
    }
  }
}

.learn-more-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .learn-more-text {
    font-weight: 700;
    font-size: 1.1em;
    color: #666;
    transition: color 0.2s ease;
  }

  .icon {
    box-sizing: content-box;
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
    color: white;
    padding: 2px;
    background-color: var(--primary);
    border-radius: 999px;
  }
}

.bottom-section {
  margin-top: auto;
}

/* ==========================================================================
   In Stock Pill Styles
   ========================================================================== */
.in-stock-pill {
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: 9999px;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.in-stock-pill--in {
  background-color: var(--success);
  color: white;
}

.in-stock-pill--out {
  background-color: var(--danger);
  color: white;
}

.in-stock-pill--card {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.1em;
  padding: 0.2em 1.25em;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.in-stock-pill--modal {
  font-size: 1em;
  padding: 0.3em 0.8em;
  margin-top: 4px;
  margin-bottom: 8px;
  align-self: flex-start;
}

.carousel-container {
  padding: 12px 0;
  background-color: rgba(0, 0, 0, 0.04);
}

/* ==========================================================================
   Product Dialog Styles (.product-dialog)
   ========================================================================== */
.product-dialog {
  --bottom-section-height: 50px;
  position: fixed;
  inset: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  margin: auto;
  border: none;
  background-color: transparent;

  &::backdrop {
    background: rgba(0, 0, 0, 0.8);
  }
}

.dialog-content {
  background-color: #fff;
  width: 100%;
  max-width: 640px;
  height: 100%;
  max-height: 100vh;
  position: relative;
  overflow-y: auto;
  margin: auto;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: none;
  cursor: pointer;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);

  &:hover {
    background-color: var(--danger);
    .close-icon { color: white; }
  }

  .close-icon {
    color: #333;
    width: 60%;
    height: 60%;
  }
}

.dialog-product-name {
  margin: 10px 0;
  flex-grow: 0;
}

.dialog-product-informarion-container {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: calc(var(--bottom-section-height) + 16px);
  overflow: hidden;
}

.icon-container {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;

  .dialog-link {
    display: grid;
    place-items: center;
    border-radius: 100%;
    svg { max-width: 100%; max-height: 100%; }
  }

  .whatsapp-icon-holder { width: 40px; height: 40px; }
  
  .location-icon-holder {
    width: 34px;
    height: 34px;
    background-color: var(--medium);
    color: white;
    svg { width: 20px; height: 20px; }
  }
}

.dialog-product-description {
  white-space: pre-line;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 12px;
  overflow-y: auto;
}

.dialog-product-informarion-container .bottom-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-section-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* ==========================================================================
   Zoom Dialog Styles
   ========================================================================== */
.image-modal {
  margin: 0;
  border: none;
  padding: 0;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  background-color: rgba(0, 0, 0, 0.9);
  overflow: hidden;

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.9);
  }

  .modal-content-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .image-modal-content {
    max-width: 95%;
    max-height: 90dvh;
    object-fit: contain;
    animation: zoom 0.25s ease-out;
  }

  .close {
    position: absolute;
    top: 16px;
    right: 24px;
    color: #fff;
    font-size: 40px;
    line-height: 1;
    cursor: pointer;
    z-index: 10;
    user-select: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.7; }
  }
}

@keyframes zoom {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* ==========================================================================
   Dark Mode Styles
   ========================================================================== */
body.dark-mode {
  .product-card, .dialog-content {
    background-color: var(--sl-color-gray-800);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .product-name, .learn-more-text, .dialog-product-name { color: #fff; }
  .product-price { color: var(--color-primary-500); }
  .dialog-product-description { color: rgba(255, 255, 255, 0.75); border-top-color: rgba(255, 255, 255, 0.1); }
  
  .dialog-product-informarion-container .bottom-section {
    background-color: var(--sl-color-gray-900);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .close-button {
    background-color: var(--sl-color-gray-700);
    .close-icon { color: #fff; }
    &:hover { background-color: var(--danger); }
  }
}
</style>