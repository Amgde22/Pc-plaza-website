<template>
    <h1 class="title">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 6H4V4h16zm-4.31 8H14v1.69c-.63.95-1 2.08-1 3.31c0 .34.04.67.09 1H4v-6H3v-2l1-5h16l1 5v1.35c-.63-.22-1.3-.35-2-.35c-1.23 0-2.36.37-3.31 1M12 14H6v4h6zm9.34 1.84l-3.59 3.59l-1.59-1.59L15 19l2.75 3l4.75-4.75z" />
        </svg>
        {{ title }} 
    </h1>

    <SelectNav :items="tags" select-all-label="tout"
        @select="onSelectTag" />

    <section 
        ref="sectionRef"
        :class="[
            'product-section',
            {
                isSection: isSection == true
            }
        ]"
    >
        <ProductCard v-for="product in displayedProduct"
            :key="product.id"
            :product="product"
            :product-images="productImages[product.id]"
        />
    </section>

    <!-- Pagination Controls (only shown when not a section and more than 1 page) -->
    <nav v-if="!isSection && totalPages > 1" class="pagination" aria-label="Pagination">
        <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            aria-label="Previous Page"
        >
            &laquo;
        </button>

        <template v-for="(page, index) in paginationRange" :key="index">
            <span v-if="page === '...'" class="pagination-ellipsis">&hellip;</span>
            <button
                v-else
                class="pagination-btn"
                :class="{ active: currentPage === page }"
                @click="goToPage(page)"
                :aria-current="currentPage === page ? 'page' : undefined"
            >
                {{ page }}
            </button>
        </template>

        <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
            aria-label="Next Page"
        >
            &raquo;
        </button>
    </nav>
</template>

<script setup>
    import ProductCard from "@components/ProductCard.vue"
    import { computed, ref, toValue, watch } from "vue"
    import SelectNav from "./SelectNav.vue";
    import useT from "@js/useT"

    const props = defineProps({
        isSection: {
            type: Boolean,
            default: false
        },
        products: {
            type: Array,
            required: true
        },
        productImages: {
            type: Object
        },
        itemsPerPage: {
            type: Number,
            default: 12
        }
    })

    const { t } = useT()
    const title = t("products.heading")

    const tags = getAllTags()
    const selectedTag = ref("")
    const currentPage = ref(1)
    const sectionRef = ref(null)

    function onSelectTag(tag) {
        selectedTag.value = tag
        currentPage.value = 1
    }

    // Reset pagination if filtered products list changes
    watch(selectedTag, () => {
        currentPage.value = 1
    })

    // computed
    const filteredProducts = computed(() => {
        const Tag = toValue(selectedTag)
        // get all products if no tag is selected
        if (Tag == "") return props.products
        // else filter by tag
        const filtered = props.products.filter(entry => entry.data.tags && entry.data.tags.includes(Tag))
        return filtered
    })

    const totalPages = computed(() => {
        const total = filteredProducts.value?.length || 0
        return Math.ceil(total / props.itemsPerPage)
    })

    const paginationRange = computed(() => {
        const total = totalPages.value
        const current = currentPage.value
        const delta = 2
        const range = []

        for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
            range.push(i)
        }

        if (current - delta > 2) {
            range.unshift('...')
        }
        if (current + delta < total - 1) {
            range.push('...')
        }

        range.unshift(1)
        if (total > 1) {
            range.push(total)
        }

        return range
    })

    const displayedProduct = computed(() => {
        const products = toValue(filteredProducts) ?? []

        // If it's a section, retain original responsive slicing logic
        if (props.isSection == true) {
            const breakPoint1 = 550
            const breakPoint2 = 800
            const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024

            if (screenWidth <= breakPoint1) {
                return products.slice(0, 6);
            } else if (screenWidth <= breakPoint2) {
                return products.slice(0, 8);
            } else {
                return products.slice(0, 12);
            }
        }

        // If not a section, apply pagination
        const start = (currentPage.value - 1) * props.itemsPerPage
        return products.slice(start, start + props.itemsPerPage)
    })

    function goToPage(page) {
        if (page < 1 || page > totalPages.value) return
        currentPage.value = page
        if (typeof window !== 'undefined' && sectionRef.value) {
            sectionRef.value.scrollIntoView({ behavior: 'smooth' })
        }
    }

    function getAllTags() {
        const products = props.products
        const tagSet = new Set()

        products.forEach((product) => {
            const productTags = product.data.tags 
            if (productTags && Array.isArray(productTags)) {
                productTags.forEach((tag) => tagSet.add(tag))
            }
        })

        return Array.from(tagSet)
    }
</script>

<style lang="less" scoped>
.title {
    font-size: 28px;
    margin-inline-start: min(5vw, 32px);
    margin-top: 2em;

    display: flex;
    align-items: center;
    gap: 8px;
}

.product-section {
    padding: 16px 20px;
    min-height: 500px;

    display: grid;
    gap: 16px;
    justify-content: center;
    align-items: start;
    grid-template-columns: repeat(auto-fit, minmax(250px, 350px));
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 24px 16px;
    flex-wrap: wrap;

    .pagination-btn {
        min-width: 40px;
        height: 40px;
        padding: 0 12px;
        border: 1px solid #e2e8f0;
        background-color: #ffffff;
        color: #1e293b;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
            background-color: #f1f5f9;
            border-color: #cbd5e1;
        }

        &.active {
            background-color: #0f172a;
            color: #ffffff;
            border-color: #0f172a;
        }

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
    }

    .pagination-ellipsis {
        padding: 0 4px;
        color: #94a3b8;
        font-weight: bold;
    }
}
</style>