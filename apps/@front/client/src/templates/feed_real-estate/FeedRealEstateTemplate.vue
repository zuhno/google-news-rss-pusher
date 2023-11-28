<script lang="ts">
import SlackBtn from "@/components/SlackBtn.vue";
export default {
  data() {
    return {
      clientId: import.meta.env.VITE_SLACK_CLIENT_ID,
    };
  },
  components: { SlackBtn },
};
</script>

<template>
  <div>
    feed real-estate template
    <SlackBtn :client-id="clientId" />
  </div>
</template>
