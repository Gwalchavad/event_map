define([
    'jquery'
], function($){
    //http://stackoverflow.com/questions/743876/list-all-javascript-events-wired-up-on-a-page-using-jquery
    //List all javascript events wired up on a page using jquery
    //usage: alert($.eventReport());
    (function($) {
        $.eventReport = function(selector, root) {
            var s = [];
            $(selector || '*', root).andSelf().each(function() {
                // the following line is the only change
                var e = $._data(this, 'events');
                if(!e) return;
                s.push(this.tagName);
                if(this.id) s.push('#', this.id);
                if(this.className) s.push('.', this.className.replace(/ +/g, '.'));
                for(var p in e) {
                    var r = e[p],
                        h = r.length - r.delegateCount;
                    if(h)
                        s.push('\n', h, ' ', p, ' handler', h > 1 ? 's' : '');
                    if(r.delegateCount) {
                        for(var q = 0; q < r.length; q++)
                            if(r[q].selector) s.push('\n', p, ' for ', r[q].selector);
                    }
                }
                s.push('\n\n');
            });
            return s.join('');
        };
        $.fn.eventReport = function(selector) {
            return $.eventReport(selector, this);
        };
    })(jQuery);

});
