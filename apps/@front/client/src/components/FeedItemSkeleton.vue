<script setup lang="ts"></script>

<template>
  <v-container class="custom-v-container">
    <v-row class="custom-v-row" no-gutters>
      <v-col class="custom-v-col--texts">
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="list-item-two-line" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
@import "@/assets/scss/variables";
@import "@/assets/scss/mixins";

.custom-v-container {
  padding: 0;
}

.custom-v-row {
  align-items: center;
}

.custom-v-col--texts {
  display: grid;
  gap: 30px;

  .v-skeleton-loader__heading {
    max-width: 80%;
    margin: 5px 16px;
  }

  .v-skeleton-loader__sentences {
    .v-skeleton-loader__text {
      max-width: 90%;
      margin: 5px 16px;
    }
  }

  @include mqMax($breakpoint-mobile) {
    gap: 10px;

    .v-skeleton-loader__heading {
      margin: 2px 10px;
    }

    .v-skeleton-loader__sentences {
      .v-skeleton-loader__text {
        margin: 2px 10px;
      }
    }
  }
}
</style>
