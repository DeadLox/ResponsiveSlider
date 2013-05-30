/**
*	Slider responsive v2.0
*
*	Liste des options:
*		[AFFICHAGE]
*		nbSlideShow 		: Nombre de slide à afficher
*		backText 			: Texte affiché dans le bouton précédent.Par défaut: ""
*		nextText 			: Texte affiché dans le bouton suivant.Par défaut: ""
*		
*		[FONCTIONNALITE]
*		speed 				: Vitesse du slider "slow","fast","medium" ou en millisecondes
*		autoPlay 			: Active ou désactive le slide automatique
*		delay 				: Interval entre chaque slide automatique en millisecondes.Par défaut: 3000ms
*		enableKeyboard  	: Active le contrôle du slider au clavier
*		infiniteLoop 		: Permet au slider de tourner en boucle
*		stopPlayHover		: Arrète le défilment automatique lorsque la souris est au dessus du slider
*		enableNav			: Active les boutons de navigation.Par défaut: Activé
*		hideNav				: Cache les boutons de navigation lorsque la souris n'est pas sur le carrousel.Par défaut: Activé
*		enablePager			: Active l'affichage d'un pager.Par défaut: Activé
*		hidePager			: Cache le pager lorsque la souris n'est pas sur le carrousel.Par défaut: Activé
*		animateResizeHeight : Active l'animation sur le redimensionnement automatique du slider en hauteur
*		
*		[Responsive]
*		enableResponsive	: Active les fonctionnalités de Responseive Design
*		resizeContent 		: Modifie le nombre de slides affichés lors du resize de la page
*		minWidth3Slides 	: Taille maximum pour l'affichage de 3 slides en pixels.Par défaut: 600px
*		minWidth2Slides 	: Taille maximum pour l'affichage de 2 slides en pixels.Par défaut: 400px
*		minHeight			: Hauteur minimum du slider
*		maxHeight 			: Hauteur maximum du slider
*
*	c.leborgne
*/
(function($) {
	$.responsiveSlider = function(slider, options) {
		var base = this;

		base.options = o = $.extend({}, $.responsiveSlider.defaults, options);

		var autoPlayTimer;

		$(slider).wrap('<div class="responsiveSlider"></div>');
		var cadreSlider = $(slider).parent();
		var cadreSlides = cadreSlider.children('ul');
		cadreSlider.wrap('<div class="cadreResponsiveSlider"></div>');

		// Slider - cadre global
		var slider = cadreSlider.parent();

		// Déclaration des variables
		var widthSlider;
		var slides = cadreSlides.children('li');
		var firstImage;
		var nbSlides = slides.length;
		var nbSlidesOrigine = nbSlides;
		var cadreSlidesWidth;
		var percentWidthSlide;
		var widthSlide;
		var animating = false;
		var maxSlideHeight = 0;
		var boutonPrec;
		var boutonSuiv;
		var hoverSlider = false;
		var slidePosition = 1;
		var slidePositionOrigine = 1;
		var copyLastImage = false;
		var pager;

		// Définit la largeur d'un slide en pourcentage
		percentWidthSlide = (100/nbSlides);
		slides.css('width', percentWidthSlide+'%');

		// Vérification des options
		if (o.nbSlideShow < 0) o.nbSlideShow = 1;
		if (o.nbSlideShow > nbSlides) o.nbSlideShow = nbSlides;
		var multipleSlideShow = (o.nbSlideShow > 1)? true : false;

		// Options
		// [AFFICHAGE]
		var nbSlideVisible 			= o.nbSlideShow
		var nbSlideVisibleOrigine 	= nbSlideVisible;
		var backText 				= o.backText;
		var nextText 				= o.nextText;
		// [FONCTIONNALITES]
		var speed 					= o.speed;
		var autoPlay 				= o.autoPlay;
		var delay 					= o.delay;
		var enableKeyboard 			= o.enableKeyboard;
		var infiniteLoop			= o.infiniteLoop;
		var stopPlayHover			= o.stopPlayHover;
		var enableNav				= o.enableNav;
		var hideNav					= o.hideNav;
		var delayHideNav			= o.delayHideNav;
		var enablePager				= o.enablePager;
		var hidePager				= o.hidePager;
		var animateResizeHeight 	= o.animateResizeHeight;
		// [RESPONSIVE]
		var enableResponsive		= o.enableResponsive;
		var resizeContent 			= o.resizeContent;
		var minWidth3Slides 		= o.minWidth3Slides;
		var minWidth2Slides 		= o.minWidth2Slides;
		var minHeight				= o.minHeight;
		var maxHeight 				= o.maxHeight;

		// Fonction d'initalisation des paramètres du slider
		base.initSlider = function(){
			// Bind du resize de la fenêtre
			if (enableResponsive) {
				$(window).on("resize", function(){
					base.updateSlider();
				});
			}

			// Affiche les boutons de navigation si le nombre de slides est supérieur à 1
			if (enableNav && nbSlides > 1 && nbSlides > nbSlideVisible) {
				slider.append('<div class="controls back">'+backText+'</div><div class="controls next">'+nextText+'</div>');
				boutonPrec = slider.children('.back');
				boutonSuiv = slider.children('.next');
				if (hideNav) {
					boutonPrec.hide();
					boutonSuiv.hide();
				}
				// Active l'écoute des touches Gauche et Droite du clavier
				$(document).on('keypress', function(e){
					if (e.keyCode == 37) boutonPrec.click();
					if (e.keyCode == 39) boutonSuiv.click();
				});
		
				// Bouton Suivant
				boutonSuiv.on('click', function(e){
					if (autoPlay) base.autoPlayStop();
					if (!animating) {
						animating = true;
						base.nextSlide();
					}
					
					e.preventDefault();
				});
				
				// Bouton Précédent
				boutonPrec.on('click', function(e){
					if (autoPlay) base.autoPlayStop();
					if (!animating) {
						animating = true;
						if (multipleSlideShow) {
							// Slide position est toujours le slide en 1ere position lors de l'affichage
							if (slidePosition <= 1) {
								cadreSlides.animate({'left':-(cadreSlidesWidth-(widthSlide*nbSlideVisible))}, speed, function(){
									animating = false;
								});
								slidePosition = nbSlides-2;
								base.calculHeightSlider();
								base.updatePager();
							} else {
								base.moveToPrev();
							}
						} else {
							if (slidePosition <= 1) {
								cadreSlides.animate({'left':-(cadreSlidesWidth-widthSlide)}, speed, function(){
									animating = false;
								});
								slidePosition = nbSlides;
								base.calculHeightSlider();
								base.updatePager();
							} else {
								base.moveToPrev();
							}
						}
					}
					
					e.preventDefault();
			
					base.autoPlay();
				});
			}

			// Initialisation du pager
			if (enablePager) {
				slider.append('<ul class="responsiveSliderPager"></ul>');
				pager = slider.children('.responsiveSliderPager');
				if (hidePager) pager.hide(); 
				slides.each(function(index){
					var clazz = 'responsiveSliderPagerSlide';
					if (index == 0 || (multipleSlideShow && index-nbSlideVisible  <= -1)) clazz = ' selected';
					pager.append('<li class="'+clazz+'"></li>');
				})

				pager.children('li').on('click', function(){
					base.goToSlide(pager.children().index($(this)));
				})
			}
			
			// Déplace les slides pour créer un effet infini
			if (infiniteLoop) {
				$('.responsiveSlider ul li:first').before($('.responsiveSlider ul li:last'));
				// Dans le cas ou le nombre total de slides est supérieur de 1 au nombre de slides affichés, il faut répéter puis supprimer la dernière image pour le défilement infini
				if (nbSlides == nbSlideVisible+1) {
					// On clone la dernière image
					$('.responsiveSlider ul li:last').after($('.responsiveSlider ul li:first').clone());
					// On recalul les largeurs et positions
					slides = cadreSlides.children('li');
					nbSlides = slides.length;
					percentWidthSlide = (100/nbSlides);
					slides.css('width', percentWidthSlide+'%');
					copyLastImage = true;
				}
				slidePosition = 2;
			}
		
			// On écoute l'entré de la souris sur le slider
			slider.on('mouseenter', function(){
				hoverSlider = true;
				if (stopPlayHover) {
					base.autoPlayStop();
				}
				if (enableNav && hideNav) {
					boutonPrec.stop(true, true).fadeIn();
					boutonSuiv.stop(true, true).fadeIn();
				}
				if (enablePager && hidePager) {
					pager.stop(true, true).fadeIn();
				}
			});
			// On écoute la sortie de la souris du slider
			slider.on('mouseleave', function(){
				hoverSlider = false;
				if (stopPlayHover) {
					base.autoPlay();
				}
				if (enableNav && hideNav) {
					boutonPrec.delay(delayHideNav).stop(true, true).fadeOut();
					boutonSuiv.delay(delayHideNav).stop(true, true).fadeOut();
				}
				if (enablePager && hidePager) {
					pager.stop(true, true).fadeOut();
				}
			});

			// Démarre l'autoPlay
			if (autoPlay) {
				base.autoPlay();
			}

			// Initialise les dimensions du slider
			base.updateSlider();
		}

		// Fonction AutoPlay
		base.autoPlay = function(){
			// Si l'aoutoPlay est activé et qu'on est pas au dessus du slider
			if (autoPlay && !hoverSlider) {
				clearInterval(autoPlayTimer);
				autoPlayTimer = setInterval(function(){
					base.nextSlide();
				}, delay);
			}
		}

		// Permet de stopper l'autoPlay
		base.autoPlayStop = function(){
			clearInterval(autoPlayTimer);
		}	

		// Bind des boutons de controls
		base.nextSlide = function(){
			if (autoPlay) base.autoPlayStop();
			if (multipleSlideShow) {
				if (slidePosition >= nbSlides-(nbSlideVisible-1)) {
					cadreSlides.animate({'left':'0'}, speed);
					slidePosition = 1;
					animating = false;
					base.calculHeightSlider();
					base.updatePager();
				} else {
					base.moveToNext();
				}
			} else {
				if (slidePosition >= nbSlides) {
					cadreSlides.animate({'left':'0'}, speed);
					slidePosition = 1;
					animating = false;
					base.calculHeightSlider();
					base.updatePager();
				} else {
					base.moveToNext();
				}
			}
			
			base.autoPlay();
		}

		// Décale les slides pour afficher le slide suivant
		base.moveToNext = function() {
			cadreSlides.animate({'left':'-='+widthSlide}, speed, function(){
				if (infiniteLoop) {
					if (copyLastImage) {
						$('.responsiveSlider ul li:last').after($('.responsiveSlider ul li').eq(1));
					} else {
						$('.responsiveSlider ul li:last').after($('.responsiveSlider ul li:first'));
					}
					cadreSlides.css({'left':'-'+widthSlide+'px'});
					slidePosition = 1;
					slidePositionOrigine++;
					if (slidePositionOrigine > nbSlidesOrigine) {
						slidePositionOrigine = 1;
					}
				}
				animating = false;
				slidePosition++;
				base.calculHeightSlider();
			
				base.updatePager();
			});
		}

		// Décale les slides pour afficher le slide suivant
		base.moveToPrev = function() {
			cadreSlides.animate({'left':'+='+widthSlide}, speed, function(){
				if (infiniteLoop) {
					if (copyLastImage) {
						$('.responsiveSlider ul li:first').before($('.responsiveSlider ul li').eq(nbSlides-2));
					} else {
						$('.responsiveSlider ul li:first').before($('.responsiveSlider ul li:last'));
					}
					cadreSlides.css({'left':'-'+widthSlide+'px'});
					slidePosition = 3;
				}
				animating = false;
				slidePosition--;
				slidePositionOrigine--;
				if (slidePositionOrigine < 1) {
					slidePositionOrigine = nbSlidesOrigine;
				}
				base.calculHeightSlider();
			
				base.updatePager();
			});
		}

		// Fonction permettant d'aller vers un slide
		base.goToSlide = function(nbSlide){
			if (autoPlay) base.autoPlayStop();
			if (multipleSlideShow) {
				if (infiniteLoop) {
					base.goToSlideInifinite(nbSlide);
				} else {
					// On vérifie si ca ne dépasse pas du nombre de slides affichés
					if (nbSlide>(nbSlidesOrigine-nbSlideVisibleOrigine)) {
						var pos = (nbSlidesOrigine-nbSlideVisibleOrigine);
						slidePosition = pos+1;
						slidePositionOrigine = pos+1;
					} else {
						slidePosition = nbSlide+1;
						slidePositionOrigine = nbSlide+1;
					}
					cadreSlides.animate({'left':-(widthSlide*(slidePosition-1))}, speed);
				}
			} else {
				if (infiniteLoop) {
					base.goToSlideInifinite(nbSlide);
				} else {
					slidePosition = nbSlide+1;
					slidePositionOrigine = nbSlide+1;
					cadreSlides.animate({'left':-(widthSlide*(slidePosition-1))}, speed);
				}
			}
			base.updatePager();
			base.autoPlay();
		}

		// Permet de se placer sur le bon slide au clic sur le pager en mode infini
		base.goToSlideInifinite = function(nbSlide){
			var decalage = (nbSlide+1)-slidePositionOrigine;
			if (decalage < 0) {
				if (decalage < -1) {
					if (slidePositionOrigine == nbSlidesOrigine && decalage == (0-(nbSlidesOrigine-1))) {
						base.nextSlide();
					} else {
						for (var d=-1;d>=decalage;d--) {
							base.moveToPrev();
						}
					}
				} else {
					base.moveToPrev();
				}
			} else {
				if (decalage > 1) {
					if (slidePositionOrigine == 1 && decalage == (nbSlidesOrigine-1)) {
						base.moveToPrev();
					} else {
						for (var d=1;d<=decalage;d++) {
							base.nextSlide();
						}
					}
				} else {
					base.nextSlide();
				}
			}
		}

		// Update Pager
		base.updatePager = function(){
			if (enablePager) {
				slides = cadreSlides.children('li');
				pager.children().removeClass('selected');
				var positionPager = slidePosition-1;
				if (multipleSlideShow) {
					if (infiniteLoop) {
						var posSlide = slidePositionOrigine-1;
						var resteSlide = ((slidePositionOrigine-1)+nbSlideVisible)-nbSlidesOrigine;
						for(var pos=0;pos<nbSlideVisible;pos++) {
							pager.children().eq(posSlide+pos).addClass('selected');
						}
						if (resteSlide > 0) {
							for(var pos=0;pos<resteSlide;pos++) {
								pager.children().eq(pos).addClass('selected');
							}
						}
					} else {
						for(var pos=0;pos<nbSlideVisible;pos++) {
							pager.children().eq(positionPager+pos).addClass('selected');
						}
					}
				} else {
					if (infiniteLoop) {
						pager.children().eq(slidePositionOrigine-1).addClass('selected');
					} else {
						pager.children().eq(positionPager).addClass('selected');
					} 
				}
			}
		}

		// Update du slider
		base.updateSlider = function(){
			widthSlider = cadreSlider.width();
			slides = cadreSlides.children('li');

			// Modification du nombre de slides affichés en fonction de la largeur de l'écran
			if (resizeContent && nbSlideVisibleOrigine > 1) {
				if (widthSlider > minWidth3Slides) {
					nbSlideVisible = nbSlideVisibleOrigine;
					multipleSlideShow = true;
				} else if (widthSlider > minWidth2Slides && widthSlider <= minWidth3Slides) {
					nbSlideVisible = 2;
					multipleSlideShow = true;
				} else if (widthSlider <= minWidth2Slides) {
					nbSlideVisible = 1;
					multipleSlideShow = false;
				}
			}

			// Recalcul la taille du slider et de chaque slide
			if (multipleSlideShow) {
				widthSlide = widthSlider/nbSlideVisible;
				cadreSlidesWidth = widthSlide*nbSlides;
			} else {
				widthSlide = widthSlider;
				cadreSlidesWidth = widthSlider*nbSlides;
			}

			// Définit la largeur et la hauteur du slider
			cadreSlides.css({'width':cadreSlidesWidth + 'px'});
			base.calculHeightSlider();

			// Positionne les slides en fonction des modes de visualisation
			if (multipleSlideShow) {
				if (slidePosition >= nbSlides-(nbSlideVisible-1)) {
					positionCadreSlides = -(cadreSlidesWidth-(widthSlide*nbSlideVisible));
				} else {
					positionCadreSlides = -(widthSlide*(slidePosition-1));
				}
			} else {
				positionCadreSlides = -(widthSlide*(slidePosition-1));
			}
			cadreSlides.css({'left':positionCadreSlides});
		}

		// Calcul et change la hauteur du slider
		base.calculHeightSlider = function() {
			maxSlideHeight = base.getCurrentSlideHeight();
			if (maxSlideHeight > 0) {
				base.changeHeightSlider(maxSlideHeight);
			} else {
				base.changeHeightSlider(minHeight);
			}
		}
				
		// Change la hauteur du slider
		base.changeHeightSlider = function(height) {
			if (maxHeight != 0 && height > maxHeight) height = maxHeight;
			if (minHeight != 0 && height < minHeight) height = minHeight;
			if (animateResizeHeight) {
				cadreSlider.animate({ 'height': height }, 'fast');
			} else {
				cadreSlider.css({ 'height': height });
			}
		}

		base.getCurrentSlideHeight = function(){
			var currentSlideHeight = 0;
			var currentSlide;
			slides = cadreSlides.children('li');
			if (multipleSlideShow) {
				currentSlide = slides.eq(slidePosition-1);
				var heightSlide = currentSlide.height();
				// Trouve le slide le plus haut parmais les slides affichés
				if (nbSlideVisible > 1) {
					for (var pos=(slidePosition-1)+1; pos<(slidePosition-1)+nbSlideVisible; pos++) {
						var slide = slides.eq(pos);
						if (slide.height() > heightSlide) {
							currentSlide = slide;
						}
					}
				}
			} else {
				if (infiniteLoop) {
					currentSlide = slides.eq(slidePosition-1);
				} else {
					currentSlide = slides.eq(slidePosition-1);
				}
			}
			if (currentSlide != null) {
				currentSlideHeight = currentSlide.height()
			}
			return currentSlideHeight;
		}
		
		// Retourne la hauteur du slide le plus haut
		base.getMaxSlideHeight = function(){
			var maxHeight = 0;
			slides.each(function(){
				var slideHeight = $(this).height();
				if (slideHeight > maxHeight) {
					maxHeight = slideHeight;
				}
			});
			return maxHeight
		}

		// Initalise le slider au chargement de la page
		base.initSlider();
	};

	$.responsiveSlider.defaults = {
		// [AFFICHAGE]
		nbSlideShow 	: 1,
		speed 			: "fast",
		backText 		: "",
		nextText 		: "",
		// [FONCTIONNALITES]
		autoPlay 		: false,
		delay 			: 3000,
		enableKeyboard 	: false,
		infiniteLoop 	: false,
		stopPlayHover	: true,
		enableNav		: true,
		hideNav			: true,
		delayHideNav	: 0,
		enablePager		: true,
		hidePager		: true,
		// RESPONSIVE
		enableResponsive: false,
		resizeContent 	: false,
		minWidth3Slides : 600,
		minWidth2Slides : 300,
		minHeight		: 0,
		maxHeight 		: 0,
		animateResizeHeight: false,
	};

	$.fn.responsiveSlider = function(options, callback) {
		return this.each(function(){
			new $.responsiveSlider(this, options);
		});
	};
})(jQuery);