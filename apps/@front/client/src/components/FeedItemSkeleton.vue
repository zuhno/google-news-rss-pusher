<script setup lang="ts"></script>

<template>
  <v-container class="custom-v-container">
    <v-row class="custom-v-row" no-gutters>
      <v-col style="max-width: fit-content">
        <v-skeleton-loader type="image" />
      </v-col>
      <v-col class="custom-v-col">
        <v-col class="custom-v-col--texts">
          <v-skeleton-loader type="heading" />
          <v-skeleton-loader type="list-item-two-line" />
        </v-col>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
.custom-v-container {
  padding: 0;
}

.custom-v-row {
  align-items: center;
}

.custom-v-col {
  height: fit-content;
}

.v-skeleton-loader__image {
  width: 180px;
  height: auto;
  aspect-ratio: 1 / 0.7;
  border-radius: 8px;
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
}
</style>
