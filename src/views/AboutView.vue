<template>
  <div class="p-6 text-white min-h-screen">
    <div class="flex flex-col md:flex-row gap-8 md:gap-16">
      <div class="flex-1 space-y-6">
        <h1 class="text-4xl font-bold" style="color: var(--p-primary-500)">
          About
        </h1>
        <p class="text-gray-300 leading-relaxed text-justify">
          KpopCat (kcat for short) is a platform to share gifs, pics, and other media related to k-pop girl groups. Its
          main purpose is to archive content and give an easy way to filter and search for stuff later. Some of the content is automatically fetched from selected Discord servers while other is directly uploaded on site. All contents is stored on KpopCat's servers, meaning only the administrators and moderators of the app have the ability to manually delete content. It aims to replace
          Gfycat but remains focused only on kpop girl groups content. By no means is this a serious project, it's just
          a passion project made by a single developer. Currently, the project is in early development and is not yet finished. Alongside the main app, there is also an Discord bot which for now only takes care of automatic re-uploads of contents & CLI tool for downloading and automation in active development.
        </p>
        <p class="text-gray-300 leading-relaxed text-justify">
          Make sure to read <router-link to="/terms" class="text-cyan-400 hover:underline">
            service terms.
          </router-link> You can support by <a href="https://ko-fi.com/" class="text-cyan-400 hover:underline">donating</a>, reporting bugs or suggesting features by joining development discord or using contact information.
        </p>

        <h1 class="text-4xl font-bold" style="color: var(--p-primary-500)">
          Contact
        </h1>
        <div class="text-gray-300 flex flex-col">
          <div>
            <span class="font-bold text-white">Mail:</span> <a href="mailto:kact@proton.me" class="text-cyan-400 hover:underline">kcat@proton.me</a>
          </div>
          <div>
            <span class="font-bold text-white">Discord Server:</span> <a href="https://discord.gg/snAbdVTp" class="text-cyan-400 hover:underline">https://discord.gg/snAbdVTp</a>
          </div>
          <div>
            <span class="font-bold text-white">Discord:</span> <em class="text-cyan-400">@chaerilyn</em>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="flex-1 space-y-6">
        <h1 class="text-3xl font-bold text-cyan-400">
          Upcoming Features
        </h1>
        <ul class="list-disc list-inside text-gray-300">
          <li>Statistics page with aggregations of data</li>
          <li>Ability to apply exclusive filters</li>
          <li>Slideshow and splitscreen mode</li>
          <li>Fleshed out working upload page for selected users</li>
          <li>Keyboard shortcuts for actions (quick download etc.)</li>
        </ul>

        <h1 class="text-3xl font-bold text-cyan-400">
          Known Issues
        </h1>
        <ul class="list-disc list-inside text-gray-300">
          <li>Imagus browser extension inconsistenly embeds content on site</li>
        </ul>

        <h1 class="text-3xl font-bold text-cyan-400">
          Changelog
        </h1>
        <ul class="list-disc list-inside text-gray-300">
          <h3 class="font-bold text-white">
            v0.51/01-04-2025:
          </h3>
          <p>- Added quick access to top posts for predefined periods</p>
          <p>- Change button icon depending on slideout state</p>
          <p>- Center content on screen on click</p>
        </ul>
      </div>
    </div>
  </div>
</template>
