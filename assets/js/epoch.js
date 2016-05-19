/* globals jQuery, EpochFront */
jQuery( document ).ready( function ( $ ) {
    var epoch = new Epoch( $, EpochFront );
    epoch.init();
} );


function Epoch( $, EpochFront  ) {
    var self = this;
    var post;
    var page;
    var areaEl;
    var nextURL;
    var prevURL;
    var lastURL;

    this.init = function (  ) {
        areaEl = document.getElementById( 'epoch-comments' );
        post = EpochFront.post;
        self.getComments( EpochFront.first_url );
        self.setupNav();
        self.setupForm();

    };

    this.getComments = function ( url ) {
        lastURL = url;
        $.when( this.api( url ) ).then( function ( r ) {
            nextURL = r.next;
            prevURL = r.prev;
            areaEl.innerHTML = r.template;
            self.hideShowNav();
        });

    };

    this.api = function( url ) {
        var key = 'epoch-cache' + url;

        var local = localStorage.getItem( key );
        local = false;
        if ( ! _.isString( local ) || "null" == local ) {
            return $.get( url ).then( function ( r, textStatus, rObj  ) {
                localStorage.setItem( key, JSON.stringify( r ) );
                r.next = rObj.getResponseHeader( 'X-WP-EPOCH-PREVIOUS' );
                r.prev = rObj.getResponseHeader( 'X-WP-EPOCH-NEXT' );
                return r;
            } );

        }else {
            return JSON.parse( local );

        }

    };

    this.setupNav = function () {
        $( '#epoch-prev' ).on( 'click', function ( e ) {
            e.preventDefault();
            page--;
            $.when( self.getComments( prevURL ) ).then( function () {
                self.scrollTo( 'epoch-wrap' );
            });
        });
        $( '#epoch-next' ).on( 'click', function ( e ) {
            e.preventDefault();
            page++;
            $.when( self.getComments( nextURL ) ).then( function () {
                self.scrollTo( 'epoch-wrap' );
            });

        });
    };

    this.hide = function( $el ){
          $el.hide().css( 'visibility', 'hidden' ).attr( 'aria-hidden', 'true' );
    };

    this.show = function( $el ){
        $el.show().css( 'visibility', 'visible' ).attr( 'aria-hidden', 'false' );
    };

    this.hideShowNav = function (  ) {
        if( 0 == nextURL ){
            self.hide( $( '#epoch-next') );
        }else{
            self.show( $( '#epoch-next' ) );
        }

        if( 0 == prevURL ){
            self.hide( $( '#epoch-prev') );
        }else{
            self.show( $( '#epoch-prev' ) );
        }
    };


    this.setupForm = function ( ) {
        var $form = $( '#commentform' );
        $form.removeAttr( 'action' );
        $form.on( 'submit', function (e) {
            e.preventDefault();

            var data = {
                content: $( '#comment' ).val(),
                post: EpochFront.post,
                author_name: '',
                author_email: '',
                author_url: '',
                epoch: true,
                parent: $( '#comment_parent' ).val(),
                _wpnonce: EpochFront._wpnonce
            };

            var authorEL = document.getElementById( 'author' );
            if ( null !== authorEL ){
                data.author_name = $( authorEL ).val();
            }

            var emailEl = document.getElementById( 'email' );
            if ( null !== emailEl ){
                data.author_email = $( emailEl ).val();
            }

            var urlEl = document.getElementById( 'url');
            if ( null !== urlEl ){
                data.author_url = $( urlEl ).val();
            }

            if ( 0 != EpochFront.user_email ){
                data.author_email = EpochFront.user_email
            }

            data.author_email = encodeURI( data.author_email );

            $.post( EpochFront.comments_core, data ).done( function ( r ) {

                $form[0].reset();
                $.when( self.getComments( lastURL ) ).done( function ( ) {
                    self.scrollTo( 'comment-' + r.id );
                });

            } ).error( function ( error ) {
                console.log( error );
            } );

        });
    };

    this.scrollTo =function ( id ) {
        var el = document.getElementById( id );
        if ( null == el ) {
            el = document.getElementById( 'epoch-wrap' );
        }

        if ( null != el ){
            var position = $( el ).offset();
            window.scrollTo(  position.left, position.top );

        }
    };

}
