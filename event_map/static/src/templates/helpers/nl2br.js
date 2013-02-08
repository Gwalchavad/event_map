/*
 * Replaces newlines with <br/>
 */
Handlebars.registerHelper('nl2br', function(text, options) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/\r\n|\r|\n/g,"<br/>");
    return new Handlebars.SafeString(text);
});
