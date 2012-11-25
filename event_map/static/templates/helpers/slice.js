    handlebars.registerHelper('slice', function(context,options) {
        for (var prop in this) {
            if(typeof this[prop] === "string"){
                if(this[prop].length > context){
                    this[prop] = this[prop].slice(0,context)+"...";
                }
            }
        }
      return options.fn(this);
    });
