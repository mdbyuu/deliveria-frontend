<script setup>
defineProps({
  label: { type: String, required: true },
  name: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  multiline: Boolean,
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
})
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="form-field" :class="$attrs.class">
    <label :for="name">{{ label }}</label>
    <textarea
      v-if="multiline"
      :id="name"
      :value="modelValue"
      :name="name"
      :aria-invalid="!!error"
      :aria-describedby="error || hint ? `${name}-help` : undefined"
      v-bind="{ ...$attrs, class: undefined }"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :id="name"
      :value="modelValue"
      :name="name"
      :type="type"
      :aria-invalid="!!error"
      :aria-describedby="error || hint ? `${name}-help` : undefined"
      v-bind="{ ...$attrs, class: undefined }"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <small v-if="error || hint" :id="`${name}-help`" :class="error ? 'field-error' : 'muted'">{{
      error || hint
    }}</small>
  </div>
</template>
