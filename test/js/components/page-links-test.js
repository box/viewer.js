module('Component - page-links', {
    setup: function () {
        this.links = [
            {bbox: [690.89, 45.87, 716.15, 63.55], uri: 'http://box.com/'}
        ];
        this.browser = Crocodoc.getUtilityForTest('browser');
        this.scope = Crocodoc.getScopeForTest(this);

        this.utilities = {
            browser: {}
        };
        this.scope = Crocodoc.getScopeForTest(this);
        this.component = Crocodoc.getComponentForTest('page-links', this.scope);
    }
});

test('init() should create links when called', function () {
    var links = [];
    this.mock(this.component)
        .expects('createLinks')
        .withArgs(links);
    this.component.init($(), links);
});

test('init() should create links with a child span element for IE workaround when called', function () {
    var $el = $('<div>');
    this.utilities.browser.ie = true;
    this.component.init($el, this.links);
    ok($el.find('.crocodoc-page-link span').length > 0, 'span element should exist');
});

test('module should broadcast `linkclick` event with appropriate data when a link is clicked', function () {
    var $el = $('<div>'),
        linkData = this.links[0];

    this.utilities.browser.ie = false;
    this.mock(this.scope)
        .expects('broadcast')
        .withArgs('linkclick', linkData);
    this.component.init($el, this.links);

    var link = $el.find('.crocodoc-page-link').get(0);
    var ev = $.Event('click');
    ev.target = link;

    $el.trigger(ev);
});
