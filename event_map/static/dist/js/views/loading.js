define(["backbone","jade!../../templates/loading"],function(e,t){var n=e.View.extend({tagname:"div",className:"span7",render:function(){return this.$el.html(t()),this}});return n});