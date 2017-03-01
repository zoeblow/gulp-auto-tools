$(window).on('resize', function() {
    var width = document.documentElement.clientWidth;
    if (width < 640) {
        $('html').css('font-size', (width / 640 * 85.335) + 'px');
    } else {
        $('html').css('font-size', '85.335px');
    }
}).triggerHandler('resize');