//Wait for the HTML Document Object Model to load
document.addEventListener("DOMContentLoaded", function (event) {

    //Returns a string with an octothorpe in front
    let anchor = document.location.hash;

    let firstIndex;

    const aboutPage = document.getElementById('about');
    const aboutContent = document.getElementById('narrower');
    const logo = document.getElementById('logo');
    const page = document.getElementById('page');

    //Returns an array-like list
    let expandables = document.getElementsByClassName('expandable');

    //Various tools for navigation
    const navManager = {
        //Changes URL to an anchor
        pushTo: function (where) {
            history.pushState({}, '', '#' + where);
        },
        //Clears anchor, but leaves an octothorpe
        pushClear: function () {
            history.pushState({}, '', '#');
        },
        //Collapses a section on the about page
        collapseSection: function (item) {
            item.nextElementSibling.style.maxHeight = null;

            //Switch writing to no opacity
            item.nextElementSibling.classList.remove('active');

            //Remove diamond indicators
            document.getElementById(item.id + 'Left').classList.remove('stay');

            document.getElementById(item.id + 'Right').classList.remove('stay');

            //Remove coloring
            item.classList.remove('active');
        },
        //Expands section on the about page
        expandSection: function (buttonName) {
            const button = document.getElementById(buttonName);
            const indicatorLeft = document.getElementById(buttonName + 'Left');
            const indicatorRight = document.getElementById(buttonName + 'Right');

            //        Expand or contract section following button
            const content = button.nextElementSibling;
            if (content.style.maxHeight) {
                navManager.collapseSection(button);
                navManager.pushTo('about');
                content.classList.remove('active');
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                button.classList.add('active');
                content.classList.add('active');
                indicatorLeft.classList.add('stay');
                indicatorRight.classList.add('stay');
                navManager.pushTo(buttonName);
            }

            //Collapse all other sections
            [].forEach.call(expandables, function (item) {
                if (item.id !== buttonName) {
                    navManager.collapseSection(item);
                }
            })
        },
        collapseAll: function () {
            [].forEach.call(expandables, function (item) {
                navManager.collapseSection(item);
            })
        },
        loadCorrectPlace: function () {
            if (anchor === '#about') {
                aboutPage.classList.add('visibleOnLoad');
                aboutContent.classList.add('visible');
                page.classList.add('showOverflow');
                logo.classList.add('inverted');
            } //Load one of the expandables
            else if (anchor !== '' && !!document.querySelector('button' + anchor)) {
                console.log('double bang');
                console.log(document.querySelector('button' + anchor));
                console.log(!!document.querySelector('button' + anchor));
                aboutPage.classList.add('visibleOnLoad');
                aboutContent.classList.add('visible');
                page.classList.add('showOverflow');
                logo.classList.add('inverted');

                navManager.expandSection(anchor.substr(1));
            } //No anchor or unknown anchor.Push to first element in slideshow
            else if (firstIndex <= 0) {
                setTimeout(function () {

                    aboutPage.classList.add('visibleOnLoad');
                    aboutContent.classList.add('visible');
                    page.classList.add('showOverflow');
                    logo.classList.add('inverted');

                    // siema.goTo(0);
                    // navManager.pushTo(siema.innerElements[0].id);
                }, 1000);
            }
        }
    };

    //Returns a number
    function getStartIndex() {
        //Find the index of the figure that matches the anchor
        firstIndex = Array.prototype.findIndex.call(document.querySelectorAll('figure'), function (item) {
            return item.id === anchor.slice(1);
        });

        //If the anchor was found, return its index. Otherwise, start carousel at 0
        if (firstIndex > -1) {
            return firstIndex;
        } else {
            return 0;
        }
    };

    // Close the about page
    function leaveAbout() {
        aboutPage.classList.remove('visible');
        aboutPage.classList.remove('visibleOnLoad');
        aboutPage.classList.add('hidden');
        aboutContent.classList.remove('visible');
        page.classList.remove('showOverflow');
        logo.classList.remove('inverted');

        setTimeout(function () {
            navManager.collapseAll()
        }, 1050);

        currentSlideName = siema.innerElements[siema.currentSlide].id;
        navManager.pushTo(currentSlideName);
    }

    const siema = new Siema({
        loop: true,
        duration: 1000,
        easing: 'ease',
        startIndex: getStartIndex(),
        onInit: function () {
            //First slide loaded shows up
            this.innerElements[this.currentSlide].classList.add('show');
        },
        onChange: (function () {
            /* Defined an Immediately Invoked Function Expression (IIFE) to create a closure
            for outgoingSlide variable. That way, it doesn't have to be defined outside
            the scope of the function.*/
            let outgoingSlide;
            return function () {
                const pieceTitle = this.innerElements[this.currentSlide].id;
                navManager.pushTo(pieceTitle);

                if (typeof outgoingSlide === 'undefined') {
                    if (firstIndex > -1) {
                        outgoingSlide = firstIndex;
                    } else {
                        outgoingSlide = 0;
                    }
                }

                //Fade out outgoing slide and fade in incoming slide
                this.innerElements[outgoingSlide].classList.remove('show');
                this.innerElements[this.currentSlide].classList.add('show');

                //New slide is now old
                outgoingSlide = this.currentSlide;
            };
        })(),
    });

    //Make figcaption text selectable on desktop by preventing Siema's functions
    document.querySelectorAll('figcaption').forEach(function (el) {
        el.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
        el.addEventListener('mousemove', function (e) {
            e.stopPropagation();
        });
        el.addEventListener('touchstart', function (e) {
            e.stopPropagation();
        });
        el.addEventListener('touchmove', function (e) {
            e.stopPropagation();
        });
    });

    document.addEventListener('keydown', function (event) {
        //Use arrow keys to navigate when about page not showing
        if (aboutPage.classList.contains('visibleOnLoad') === false && aboutPage.classList.contains('visible') === false) {
            if (event.code === 'ArrowLeft') {
                siema.prev();
            } else if (event.code === 'ArrowRight') {
                siema.next();
            }
        }

        //Use escape key to make about page go away
        if (event.code === 'Escape') {
            leaveAbout();
        }
    });

    //Open site to anchor
    window.addEventListener('load', function () {
        navManager.loadCorrectPlace();

    });

    //Toggle about page
    logo.addEventListener('click', function () {

        logo.classList.toggle('inverted');
        currentSlideName = siema.innerElements[siema.currentSlide].id;

        if (aboutPage.classList.contains('visibleOnLoad') || aboutPage.classList.contains('visible')) {
            leaveAbout();
        } else {
            //No classes in list
            aboutPage.classList.add('visible');
            aboutContent.classList.add('visible');
            page.classList.add('showOverflow');
            navManager.pushTo('about');
        }
    });

    //Toggling expansions
    document.body.addEventListener('click', function (e) {
        if (e.target.nodeName === 'BUTTON') {
            navManager.expandSection(e.target.id);
        }
    })
});
