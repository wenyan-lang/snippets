<template>
<span 
  class='disqus-comment-count'
  :data-disqus-identifier='identifier'
  :data-disqus-url='url'
><slot/></span>
</template>

<script>

let LastUpdated = 0
const UpdateInterval = 800

export default {
  name: 'vue-disqus-count',
  inheritAttrs: true,
  props: {
    shortname: {
      type: String,
      required: true
    },
    identifier: {
      type: String,
      required: false
    },
    url: {
      type: String,
      required: false
    },
  },
  mounted () {
    if (window.DISQUSWIDGETS) {
      this.load()
      return
    }
    this.init()
  },
  methods: {
    load () {
      if (new Date() - LastUpdated < UpdateInterval)
        return
      LastUpdated = +new Date()
      window.DISQUSWIDGETS.getCount({ reset: true })
      setTimeout(()=>{
        window.DISQUSWIDGETS.getCount({ reset: true })
      }, UpdateInterval)
    },
    init () {
      setTimeout(() => {
        let d = document
          , s = d.createElement('script')
        s.setAttribute('id', 'dsq-count-scr')
        s.setAttribute('data-timestamp', +new Date())
        s.type = 'text/javascript'
        s.async = true
        s.src = `//${this.shortname}.disqus.com/count.js`
        ;(d.head || d.body).appendChild(s)
      }, 0)
    }
  }
}
</script>