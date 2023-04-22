import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "周生的博客",
    description: "私人领地",
    srcDir: 'src',
    lastUpdated: true,
    head: [
        ['link', {rel: "icon", type: "image/png", href: "/logo.png"}],
    ],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: '主页', link: '/'},
            {text: '关于', link: '/about'},
        ],
        socialLinks: [
            {icon: 'github', link: 'https://github.com/sdrpsps'}
        ],
        footer: {
            message: 'Thank You For Your Visit 💖',
            copyright: 'Copyright © 2023 Hsiang Chou'
        },
        search: {
            provider: 'local'
        },
        logo: "/logo.png"
    }
})
