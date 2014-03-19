module('Component - page-links', {
    setup: function () {
        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('page-links', this.scope);
    }
});

test('init() should call createLinks() when called', function () {
    var links = [];
    this.mock(this.component)
        .expects('createLinks')
        .withArgs(links);
    this.component.init($(), links);
});

test('module should broadcast `linkclicked` event with appropriate data when a link is clicked', function () {
    var $el = $('<div>'),
        linkData = {"bbox": [690.89, 45.87, 716.15, 63.55], "uri": "http://www.bamag.com/email/Tgyk5W"},
        links = [linkData];

    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('linkclicked', linkData);
    this.component.init($el, links);

    var link = $el.find('.crocodoc-page-link').get(0);
    var ev = $.Event('click');
    ev.target = link;

    $el.trigger(ev);
});
