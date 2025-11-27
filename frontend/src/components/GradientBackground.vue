<template>
  <div class="fixed inset-0 -z-10 overflow-hidden w-full h-full">
    <!-- Base gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#030308] via-[#0a0f1f] to-[#050510]"></div>
    
    <!-- Subtle mesh gradient overlay -->
    <div class="absolute inset-0 opacity-60" style="background-image: 
      radial-gradient(ellipse at 15% 10%, rgba(56,189,248,0.12), transparent 40%),
      radial-gradient(ellipse at 85% 5%, rgba(99,102,241,0.1), transparent 35%),
      radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.05), transparent 50%),
      radial-gradient(ellipse at 10% 85%, rgba(249,115,22,0.12), transparent 40%),
      radial-gradient(ellipse at 90% 80%, rgba(236,72,153,0.08), transparent 35%);
    "></div>
    
    <!-- Animated glow orbs -->
    <div class="absolute -top-20 sm:-top-40 right-[-5%] h-[45vh] w-[45vh] sm:h-[60vh] sm:w-[60vh] rounded-full bg-gradient-to-br from-cyan-500/25 to-blue-600/20 blur-[100px] sm:blur-[140px]"></div>
    <div class="absolute top-[30%] left-[-10%] h-[30vh] w-[30vh] sm:h-[40vh] sm:w-[40vh] rounded-full bg-gradient-to-tr from-indigo-500/15 to-purple-500/10 blur-[80px] sm:blur-[120px]"></div>
    <div class="absolute bottom-[-10%] sm:bottom-[-15%] left-[20%] h-[50vh] w-[50vh] sm:h-[65vh] sm:w-[65vh] rounded-full bg-gradient-to-t from-orange-500/20 via-amber-500/15 to-transparent blur-[120px] sm:blur-[160px]"></div>
    <div class="absolute bottom-[20%] right-[-5%] h-[25vh] w-[25vh] sm:h-[35vh] sm:w-[35vh] rounded-full bg-gradient-to-bl from-pink-500/10 to-rose-500/5 blur-[80px] sm:blur-[100px]"></div>
    
    <!-- Noise texture overlay for depth -->
    <div class="absolute inset-0 opacity-[0.015]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"></div>
  </div>
</template>
