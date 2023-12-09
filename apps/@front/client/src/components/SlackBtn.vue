<script lang="ts">
export default {
  props: {
    authorizeLink: String,
  },
};
</script>

<template>
  <a :href="authorizeLink">
    <button class="btn-slack">
      <i class="pi pi-slack"></i>
      Add to Slack
    </button>
  </a>
</template>

<style scoped lang="scss">
a {
  .btn-slack {
    outline: none;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    background-color: #f5f5f5;
    font-size: 15px;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    gap: 5px;
    align-items: center;
  }
}
</style>
