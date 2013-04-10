define([
    'underscore',
    'backbone',
    'jade!../../templates/list_option'
],function (_,Backbone,temp_list_option){
     var ListOptionView = Backbone.View.extend({
        tagName: "div",
        className: "span3",
        id: "listDescription",
        childrenEL: "#listOptionPanels",
        initialize: function() {

        },
        render: function() {
            this.$el.append(
                temp_list_option(
                    this.model.toJSON()
                )
            );
            return this;
        },
    });
    return ListOptionView;
});
