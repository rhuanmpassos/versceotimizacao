<template>
  <div class="group relative overflow-hidden rounded-2xl sm:rounded-3xl w-full max-w-full">
    <!-- Gradient border effect -->
    <div class="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/20 via-white/5 to-white/10 p-[1px]">
      <div class="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0a0f1f] via-[#080d1a] to-[#0a0f1f]"></div>
    </div>
    <!-- Card content -->
    <div class="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
      <div class="p-5 sm:p-6 md:p-8 lg:p-10">
        <slot />
      </div>
    </div>
    <!-- Subtle hover glow -->
    <div class="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-indigo-500/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-cyan-500/10 group-hover:via-blue-500/10 group-hover:to-indigo-500/10 group-hover:opacity-100"></div>
  </div>
</template>