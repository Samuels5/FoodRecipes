<template>
  <div class="star-rating" :class="sizeClass">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      class="star"
      :class="{
        'star-filled': star <= displayRating,
        'star-hover': !readonly && star <= hoverRating,
        'star-readonly': readonly,
      }"
      :disabled="readonly"
      @click="!readonly && $emit('rate', star)"
      @mouseenter="!readonly && (hoverRating = star)"
      @mouseleave="!readonly && (hoverRating = 0)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :fill="star <= displayRating ? 'currentColor' : 'none'"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  rating: {
    type: Number,
    default: 0,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: "medium", // small, medium, large
    validator: (value) => ["small", "medium", "large"].includes(value),
  },
});

const emit = defineEmits(["rate"]);

const hoverRating = ref(0);

const displayRating = computed(() => {
  if (props.readonly) {
    return Math.round(props.rating);
  }
  return hoverRating.value || Math.round(props.rating);
});

const sizeClass = computed(() => {
  return `star-rating-${props.size}`;
});
</script>

<style scoped>
.star-rating {
  display: flex;
  gap: 2px;
}

.star {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  transition: all 0.2s ease;
}

.star:disabled {
  cursor: default;
}

.star svg {
  transition: all 0.2s ease;
}

.star-filled {
  color: #f97316; /* orange-500 */
}

.star:not(.star-filled):not(.star-readonly) {
  color: #fed7aa; /* orange-200 */
}

.star-hover {
  color: #ea580c; /* orange-600 */
  transform: scale(1.1);
}

.star-readonly {
  cursor: default;
}

.star-readonly:not(.star-filled) {
  color: #d1d5db; /* gray-300 */
}

/* Size variants */
.star-rating-small .star svg {
  width: 14px;
  height: 14px;
}

.star-rating-medium .star svg {
  width: 18px;
  height: 18px;
}

.star-rating-large .star svg {
  width: 24px;
  height: 24px;
}

/* Hover effects for interactive stars */
.star:not(.star-readonly):hover {
  transform: scale(1.1);
}
</style>
