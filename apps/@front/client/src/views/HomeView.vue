<script setup lang="ts"></script>

<template>
  <main>
    <a
      href="https://slack.com/oauth/v2/authorize?scope=incoming-webhook&client_id=3636965766418.4749362651861"
    >
      <button class="btn-slack">Add to Slack</button>
    </a>
  </main>
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
