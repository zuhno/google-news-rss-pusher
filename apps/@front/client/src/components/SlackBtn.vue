<script setup lang="ts">
const { authorizeLink } = defineProps({ authorizeLink: String });
</script>

<template>
  <a :href="authorizeLink">
    <button class="btn-slack">
      <i class="pi pi-slack"></i>
      <span>Add to Slack</span>
    </button>
  </a>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables";
@use "@/assets/scss/mixins";

a {
  .btn-slack {
    outline: none;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    background-color: whitesmoke;
    font-size: 0.9rem;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    gap: 5px;
    align-items: center;
    color: black;

    @include mixins.mqMax(variables.$breakpoint-mobile) {
      padding: 15px;
      border-radius: 50%;

      i {
        font-size: 1.5rem;
      }
      span {
        display: none;
      }
    }
  }
}
</style>
