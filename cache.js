this.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open("v1").then(function(cache) {
			return cache.addAll([
				"index.html",
				"css/styles.css",
				"js/main.js",
				"lib/jQuery.js",
				"lib/require.js"
			]);
		})
	);
});

this.addEventListener("fetch", function(event) {
	var response;
	// event.respondWith(caches.match(event.request).catch(function() {
	// 	return fetch(event.request);
	// }).then(function(r) {
	// 	response = r;
	// 	if (response) {
	// 		caches.open("v1").then(function(cache) {
	// 			cache.put(event.request, response);
	// 		});

	// 		return response.clone();
	// 	}
	// 	return 3.14;
	// }));
});
