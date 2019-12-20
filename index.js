const db = require("./db");
const path = require("path");
const mime = require("mime");
const contenu = require("contenu");
const iplocation = require("iplocation");

async function locate (ip) {

	if (ip === "::1") {

		return {

			city: "Unknown",
			country: "Unknown"

		}

	} else return await iplocation(ip);

}

(async () => {

	await db.init();
	
	contenu.routes.admin.get("/plugins/analytics", (req, res) => {

		res.render(path.join(__dirname, "views", "index.ejs"), {

			partial (_) {

				return path.join(__dirname, "..", "..", "views", "partials", _);

			},

			db

		});

	});

	contenu.routes.www.after((req, res) => {

		res.on("close", async () => {
			
			if (res.statusCode === 200 || res.statusCode === 304) {

				const ip = req.connection.remoteAddress.replace("::ffff:", "");
				const location = await locate(ip);
	
				// console.log(ip, location, req.get("Referrer"), req.path);
				// console.log(req.path, res.getHeaders());

				db.addHit({
					
					path: req.path,
					date: new Date(),
					origin: location,
					referrer: req.get("Referrer"),
					userAgent: req.get("User-Agent"),
					contentType: (res.get("Content-Type") || mime.getType(req.path) || "text/html").split(";")[0].trim()
					
				});
	
			}

		});

	});

})();
