// Enable pusher logging - don't include this in production
Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
};
// Flash fallback logging - don't include this in production
WEB_SOCKET_DEBUG = true;

var network = function() {

    var networked_game = false;
    var logged_in_users = 0;
    function update_member_count(cnt) {
        logged_in_users = cnt;
        Pusher.log("update_member_count", cnt);
    }
    function add_member(id, info) {

        }
    function remove_member(id, info) {

        }
    var game_id = 1;
    var channel_id = 'presence-tetris-' + game_id;

    var pusher = new Pusher('4aeaafae8e422b589d9a');
    var channel = pusher.subscribe(channel_id);

/*
    channel.bind('pusher:subscription_succeeded',
    function(members) {
        // for example
        update_member_count(members.count);

        members.each(function(member) {
            // for example:
            add_member(member.id, member.info);
        })
    });

    channel.bind('pusher:member_added',
    function(member) {
        // for example:
        add_member(member.id, member.info);
        Pusher.log("added member")
    });

    channel.bind('pusher:member_removed',
    function(member) {
        // for example:
        remove_member(member.id, member.info);
    });
*/
    channel.bind('client-createBlock',
    function(data) {
        alert(data);
    });

    channel.bind('createBlock',
    function(data) {
		player2.internal().addObject(data);
    });

    channel.bind('updateBlock',
    function(data) {
		player2.internal().addObject(data);
    });

    return {
        startNetworkGame: function() {
            Pusher.log("starting network game, looking for other players");
            networked_game = true;
        },
        isNetworkedGame: function() {
            return networked_game;
        },

		startMirroredGame: function() {
			networked_game = true;
			player1.run();
			player2.run();
		},
        send_message: function(evt, data) {
//			channel.trigger('client-' + evt, data);
	
            $.ajax({
                type: "POST",
                dataType: "html",
                url: "/send_event/",
                data: ({
                    channel_name: channel_id,
                    event_name: evt,
                    data: JSON.stringify(data)
                }),
                success: function(data) {
                    Pusher.log("done");
                }
            });

        }

    }
} ();
