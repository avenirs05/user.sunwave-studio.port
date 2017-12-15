jQuery(document).ready(function() {
    jQuery('.toggle-nav').click(function(e) {
        jQuery(this).toggleClass('active');
        jQuery('.menu ul').toggleClass('active');

        e.preventDefault();
    });

});

function send_form(id) {
    var msg   = $('#'+id+'').serialize();
	var e   =  msg;
    var msg2 = msg.split('&');
    var msg3 = msg2[1].split('=');
    if (!msg3[1]=='') {
        $.ajax({
            type: "POST",
            url: "include/send.php",
            data: e,
            success: function(e) {
				switch(id){
					case 'modal_form':
						yaCounter45504900.reachGoal('call_back');
						break;
					case 'cnt4_form':
						yaCounter45504900.reachGoal('order_design');
						break;
					case 'tarif_modal_main_form':
						yaCounter45504900.reachGoal('order_tariff');
						break;
					case 'third_form':
						yaCounter45504900.reachGoal('order_design');
						break;
					case 'cnt9_form':
						yaCounter45504900.reachGoal('help');
						break;
					case 'cnt102_form':
						yaCounter45504900.reachGoal('begin_ceate_design');
						break;
					case 'cnt13_form':
						yaCounter45504900.reachGoal('order_design');
						break;
					case 'cnt10_form':
						yaCounter45504900.reachGoal('send_request');
						break;
				}
                $(".close").click(), $("#thx").click()
            },
            error: function(e, c) {
                alert("Возникла ошибка: " + e.responseCode)
            }
        });
    } else {
        $('#'+id+'').find('[name = "phone_f"]').css({
            'border-color' : 'red'
        });
    }
};
function send_form2(id) {
    var msg   = $('#'+id+'').serialize();
    var e   =  msg;
    var msg2 = msg.split('&');
    var msg3 = msg2[1].split('=');
    if (!msg3[1]=='') {
        $.ajax({
            type: "POST",
            url: "include/send2.php",
            data: e,
            success: function(e) {
                $(".close").click(), $("#thx2").click()
            },
            error: function(e, c) {
                alert("Возникла ошибка: " + e.responseCode)
            }
        });
    } else {
        $('#'+id+'').find('[name = "phone_f"]').css({
            'border-color' : 'red'
        });
    }
};


$(document).ready(function() {
    $('input[name=phone_f]').mask('+7 ( 999 ) 999-99-99'); // mask

    $("#write").owlCarousel({
        loop: true,
        margin: 35,
        mouseDrag: true,
        touchDrag: true,
        nav: true,
        navText: ['<i class="icon icon-s-link_left">', '<i class="icon icon-s-link_right">'],
        responsive: {
            0: {
                items: 1
            },
            450: {
                items: 2
            },
            1100: {
                items: 3
            }
        }
    });
    $("#answers").owlCarousel({
        loop: true,
        margin: 0,
        mouseDrag: true,
        touchDrag: true,
        dots: true,
        nav: true,
        navText: ['<i class="icon icon-s-link_left">', '<i class="icon icon-s-link_right">'],
        responsive: {
            0: {
                items: 1
            },
            450: {
                items: 1
            },
            1100: {
                items: 1
            }
        }
    });
    var owl = $('#steps');
    $('a.next_step').click(function() {
        owl.trigger('next.owl.carousel');
    });
    $('a.prev_step').click(function() {
        owl.trigger('prev.owl.carousel');
    });
    $("#steps").owlCarousel({
        loop: false,
        margin: 0,
        mouseDrag: true,
        touchDrag: true,
        dots: true,
        nav: false,
        navText: ['<i class="icon icon-s-link_left">', '<i class="icon icon-s-link_right">'],
        responsive: {
            0: {
                items: 1
            },
            450: {
                items: 1
            },
            1100: {
                items: 1
            }
        }
    });
});






$("body").on('click', 'a.go_to', function(e){
  var fixed_offset = 100;
  $('html,body').stop().animate({ scrollTop: $(this.hash).offset().top - fixed_offset }, 1000);
  e.preventDefault();
});

if ($(window).width() <= '769'){google.maps.event.addDomListener(window, 'load', init2);}
    else {google.maps.event.addDomListener(window, 'load', init);}




var map, markersArray = [];

function bindInfoWindow(marker, map, location) {
    google.maps.event.addListener(marker, 'click', function() {
        function close(location) {
            location.ib.close();
            location.infoWindowVisible = false;
            location.ib = null;
        }

        if (location.infoWindowVisible === true) {
            close(location);
        } else {
            markersArray.forEach(function(loc, index){
                if (loc.ib && loc.ib !== null) {
                    close(loc);
                }
            });

            var boxText = document.createElement('div');
            boxText.style.cssText = 'background: #fff;';
            boxText.classList.add('md-whiteframe-2dp');

            function buildPieces(location, el, part, icon) {
                if (location[part] === '') {
                    return '';
                } else if (location.iw[part]) {
                    switch(el){
                        case 'photo':
                            if (location.photo){
                                return '<div class="iw-photo" style="background-image: url(' + location.photo + ');"></div>';
                            } else {
                                return '';
                            }
                            break;
                        case 'iw-toolbar':
                            return '<div class="iw-toolbar"><h3 class="md-subhead">' + location.title + '</h3></div>';
                            break;
                        case 'div':
                            switch(part){
                                case 'email':
                                    return '<div class="iw-details"><i class="material-icons" style="color:#4285f4;"><img src="//cdn.mapkit.io/v1/icons/' + icon + '.svg"/></i><span><a href="mailto:' + location.email + '" target="_blank">' + location.email + '</a></span></div>';
                                    break;
                                case 'web':
                                    return '<div class="iw-details"><i class="material-icons" style="color:#4285f4;"><img src="//cdn.mapkit.io/v1/icons/' + icon + '.svg"/></i><span><a href="' + location.web + '" target="_blank">' + location.web_formatted + '</a></span></div>';
                                    break;
                                case 'desc':
                                    return '<label class="iw-desc" for="cb_details"><input type="checkbox" id="cb_details"/><h3 class="iw-x-details">Details</h3><i class="material-icons toggle-open-details"><img src="//cdn.mapkit.io/v1/icons/' + icon + '.svg"/></i><p class="iw-x-details">' + location.desc + '</p></label>';
                                    break;
                                default:
                                    return '<div class="iw-details"><i class="material-icons"><img src="//cdn.mapkit.io/v1/icons/' + icon + '.svg"/></i><span>' + location[part] + '</span></div>';
                                    break;
                            }
                            break;
                        case 'open_hours':
                            var items = '';
                            if (location.open_hours.length > 0){
                                for (var i = 0; i < location.open_hours.length; ++i) {
                                    if (i !== 0){
                                        items += '<li><strong>' + location.open_hours[i].day + '</strong><strong>' + location.open_hours[i].hours +'</strong></li>';
                                    }
                                    var first = '<li><label for="cb_hours"><input type="checkbox" id="cb_hours"/><strong>' + location.open_hours[0].day + '</strong><strong>' + location.open_hours[0].hours +'</strong><i class="material-icons toggle-open-hours"><img src="//cdn.mapkit.io/v1/icons/keyboard_arrow_down.svg"/></i><ul>' + items + '</ul></label></li>';
                                }
                                return '<div class="iw-list"><i class="material-icons first-material-icons" style="color:#4285f4;"><img src="//cdn.mapkit.io/v1/icons/' + icon + '.svg"/></i><ul>' + first + '</ul></div>';
                            } else {
                                return '';
                            }
                            break;
                    }
                } else {
                    return '';
                }
            }

            boxText.innerHTML =
                buildPieces(location, 'photo', 'photo', '') +
                buildPieces(location, 'iw-toolbar', 'title', '') +
                buildPieces(location, 'div', 'address', 'location_on') +
                buildPieces(location, 'div', 'web', 'public') +
                buildPieces(location, 'div', 'email', 'email') +
                buildPieces(location, 'div', 'tel', 'phone') +
                buildPieces(location, 'div', 'int_tel', 'phone') +
                buildPieces(location, 'open_hours', 'open_hours', 'access_time') +
                buildPieces(location, 'div', 'desc', 'keyboard_arrow_down');

            var myOptions = {
                alignBottom: true,
                content: boxText,
                disableAutoPan: true,
                maxWidth: 0,
                pixelOffset: new google.maps.Size(-140, -40),
                zIndex: null,
                boxStyle: {
                    opacity: 1,
                    width: '280px'
                },
                closeBoxMargin: '0px 0px 0px 0px',
                infoBoxClearance: new google.maps.Size(1, 1),
                isHidden: false,
                pane: 'floatPane',
                enableEventPropagation: false
            };

            location.ib = new InfoBox(myOptions);
            location.ib.open(map, marker);
            location.infoWindowVisible = true;
        }
    });
}

function init() {
    var mapOptions = {
        center: new google.maps.LatLng(55.80528516473825,37.310498373291),
        zoom: 15,
        gestureHandling: 'auto',
        fullscreenControl: false,
        zoomControl: true,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        scaleControl: true,
        scrollwheel: false,
        streetViewControl: false,
        draggable : true,
        clickableIcons: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"color":"#8737a5"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#8737a5"}]}]
    }
    var mapElement = document.getElementById('map');
    var map = new google.maps.Map(mapElement, mapOptions);
    var locations = [
        {"title":"Ильинское ш., 12","address":"Ильинское ш., 12, Красногорск, Московская обл., Россия, 143405","desc":"","tel":"","int_tel":"","email":"","web":"","web_formatted":"","open":"","time":"","lat":55.8050919,"lng":37.32493939999995,"vicinity":"Красногорск","open_hours":"","marker":{"url":"images/map_marker.png","scaledSize":{"width":38,"height":54,"j":"px","f":"px"},"origin":{"x":0,"y":0},"anchor":{"x":12,"y":42}},"iw":{"address":true,"desc":true,"email":true,"enable":true,"int_tel":true,"open":true,"open_hours":true,"photo":true,"tel":true,"title":true,"web":true}}
    ];
    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            icon: locations[i].marker,
            position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
            map: map,
            title: locations[i].title,
            address: locations[i].address,
            desc: locations[i].desc,
            tel: locations[i].tel,
            int_tel: locations[i].int_tel,
            vicinity: locations[i].vicinity,
            open: locations[i].open,
            open_hours: locations[i].open_hours,
            photo: locations[i].photo,
            time: locations[i].time,
            email: locations[i].email,
            web: locations[i].web,
            iw: locations[i].iw
        });
        markersArray.push(marker);

        if (locations[i].iw.enable === true){
            bindInfoWindow(marker, map, locations[i]);
        }
    }
}
function init2() {
    var mapOptions = {
        center: new google.maps.LatLng(55.8050919,37.32493939999995),
        zoom: 15,
        gestureHandling: 'auto',
        fullscreenControl: false,
        zoomControl: true,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        scaleControl: true,
        scrollwheel: false,
        streetViewControl: false,
        draggable : true,
        clickableIcons: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"color":"#8737a5"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#8737a5"}]}]
    }
    var mapElement = document.getElementById('map');
    var map = new google.maps.Map(mapElement, mapOptions);
    var locations = [
        {"title":"Ильинское ш., 12","address":"Ильинское ш., 12, Красногорск, Московская обл., Россия, 143405","desc":"","tel":"","int_tel":"","email":"","web":"","web_formatted":"","open":"","time":"","lat":55.8050919,"lng":37.32493939999995,"vicinity":"Красногорск","open_hours":"","marker":{"url":"images/map_marker.png","scaledSize":{"width":38,"height":54,"j":"px","f":"px"},"origin":{"x":0,"y":0},"anchor":{"x":12,"y":42}},"iw":{"address":true,"desc":true,"email":true,"enable":true,"int_tel":true,"open":true,"open_hours":true,"photo":true,"tel":true,"title":true,"web":true}}
    ];
    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            icon: locations[i].marker,
            position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
            map: map,
            title: locations[i].title,
            address: locations[i].address,
            desc: locations[i].desc,
            tel: locations[i].tel,
            int_tel: locations[i].int_tel,
            vicinity: locations[i].vicinity,
            open: locations[i].open,
            open_hours: locations[i].open_hours,
            photo: locations[i].photo,
            time: locations[i].time,
            email: locations[i].email,
            web: locations[i].web,
            iw: locations[i].iw
        });
        markersArray.push(marker);

        if (locations[i].iw.enable === true){
            bindInfoWindow(marker, map, locations[i]);
        }
    }
}

$("#tarif_choose1").click(function(){
    $("#tarif_title").text('Тариф "Эскиз"');
    $("#formname").val('Форма Выбрать тариф : Тариф "Эскиз"');

});
$("#tarif_choose2").click(function(){
    $("#tarif_title").text('Тариф "Рабочий"');
    $("#formname").val('Форма Выбрать тариф : Тариф "Рабочий"');

});
$("#tarif_choose3").click(function(){
    $("#tarif_title").text('Тариф "Комплексный"');
    $("#formname").val('Форма Выбрать тариф : Тариф "Комплексный"');

});

$(".ws-header__parallax-layer").parallax(
    { mouseport: $("#content1")},
    { xparallax: '20px',    yparallax: '0px' },      // Layer 1
    { xparallax: '50px',    yparallax: '0px' },       // Layer 2
    { xparallax: '50px',    yparallax: '0px' }       // Layer 2
);

if ($(window).width() <= '1030'){
	$('.block1').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	$('.block2').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	$('.block5').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	$('.block6').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	
	$('#blc4_item1').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	$('#blc4_item2').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	$('#blc3_item1').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	$('#blc3_item2').click(function(){
		$(this).css('opacity','1');
		var lnk = $(this).find('a.btn_style');
		lnk.click();
	});
	
}


$('.go_to').click(function(){
		$('.toggle-nav').click();
	});