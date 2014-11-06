/*
 * Copyright 2013-2014 Brett Mayson <brett@bmandesigns.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* Anonymous function is used not to pollute environment */
(function(Nuvola)
{
	/**
	 * Creates integration binded to Nuvola JS API
	 */
	 
	function clickButton(name){
	    var cusid_ele = document.getElementsByClassName(name);
        for (var i = 0; i < cusid_ele.length; ++i) {
            var item = cusid_ele[i];  
            item.click();
        }
	}
	 
	var Integration = function()
	{
		Nuvola.onMessageReceived = Nuvola.bind(this, this.messageHandler);
		this.name = "SoundCloud";
		
		this.state = Nuvola.STATE_NONE;
		this.can_prev = null;
		this.can_next = null;
		this.can_thumbs_up = true;
		this.can_thumbs_down = false;
		this.update();
	};
	
	/**
	 * Updates current playback state
	 */
	Integration.prototype.update = function()
	{

		var state = Nuvola.STATE_NONE;
		var can_prev = true;
		var can_next = true;
		var album_art = null;
		var song = null;
		var artist = "Unavailable";
		var album = "Unavailable";
		
		try{
		    var nState = null;
		    var cusid_ele = document.getElementsByClassName('playControl');
            for (var i = 0; i < cusid_ele.length; ++i) {
                var item = cusid_ele[i];  
                nState = item.innerHTML;
            }
            
            switch(nState){
                case 'Pause current':
                    state = Nuvola.STATE_PLAYING;
                    break;
                case 'Play current':
                    state = Nuvola.STATE_PAUSED;
                    break;
            }
        }catch(e){}
        
        try{
            var cusid_ele = document.getElementsByClassName('playbackTitle__link');
            for (var i = 0; i < cusid_ele.length; ++i) {
                var item = cusid_ele[i];  
                song = item.innerHTML;
            }
        }catch(e){}
		
		can_thumbs_up = true;
		can_thumbs_down = false;
		
		// Submit data to Nuvola backend
		Nuvola.updateSong(song, artist, album, album_art, state);

		// Update actions
		if (this.can_prev !== can_prev)
		{
			this.can_prev = can_prev;
			Nuvola.updateAction(Nuvola.ACTION_PREV_SONG, can_prev);
		}
		if (this.can_next !== can_next)
		{
			this.can_next = can_next;
			Nuvola.updateAction(Nuvola.ACTION_NEXT_SONG, can_next);
		}
		
		// Schedule update in 500ms
		setTimeout(Nuvola.bind(this, this.update), 500);
	}
	
	/**
	 * Message handler
	 * @param cmd command to execute
	 */
	Integration.prototype.messageHandler = function(cmd)
	{
		/* Respond to user actions */
		try
		{
			switch (cmd)
			{
			case Nuvola.ACTION_PLAY:
				clickButton('playControl');
				break;
			case Nuvola.ACTION_PAUSE:
				clickButton('playControl');
				break;
			case Nuvola.ACTION_TOGGLE_PLAY:
				clickButton('playControl');
				break;
			case Nuvola.ACTION_PREV_SONG:
				clickButton('skipControl__previous');
				break;
			case Nuvola.ACTION_NEXT_SONG:
				clickButton('skipControl__next');
				break;
			case Nuvola.ACTION_THUMBS_UP:
				clickButton('.playing .sc-button-like');
				break;
			default:
				// Other commands are not supported
				throw {"message": "Action Not Supported"};
			}
			console.log(this.name + ": command '" + cmd + "' executed.");
		}
		catch (e)
		{
			throw (this.name + ": " + e.message);
		}
	}
	
	/* Store reference */ 
	Nuvola.integration = new Integration(); // Singleton

// Immediately call the anonymous function with Nuvola JS API main object as an argument.
// Note that "this" is set to the Nuvola JS API main object.
})(this);
