<script lang="ts">
export default {
  props: {
    clientId: String,
  },
};
</script>

<template>
  <a :href="'https://slack.com/oauth/v2/authorize?scope=incoming-webhook&client_id=' + clientId">
    <button class="btn-slack">Add to Slack</button>
  </a>
</template>

<style scoped lang="scss">
.btn {
  &-slack {
    outline: none;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    background-color: #f5f5f5;
    font-size: 20px;
    cursor: pointer;
  }
}
</style>
