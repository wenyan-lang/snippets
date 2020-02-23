<template>
<div class="spinner" style="text-align:center">
  <span class="lds-ring">
    <div></div>
  </span>
</div>
</template>

<style lang="stylus" scoped>
@keyframes lds-ring {
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(360deg)
  }
}

.lds-ring
  display: inline-block
  position: relative
  width: 80px
  height: 80px
  opacity: 0.3

  div 
    box-sizing: border-box
    display: block
    position: absolute
    width: 64px
    height: 64px
    margin: 4px
    border: 4px solid grey
    border-radius: 50%
    animation: lds-ring 0.7s linear infinite
    border-color: grey transparent transparent transparent
</style>