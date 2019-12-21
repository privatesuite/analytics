const db = require("./db");
const path = require("path");
const mime = require("mime");
const contenu = require("contenu");
const iplocation = require("iplocation").default;

async function locate (ip) {

	if (ip === "::1") {

		return {}

	} else {

		const l = await iplocation(ip)
		console.log(l);

		delete l.latitude;
		delete l.longitude;
		delete l.ip;

		return l;

	}

}

function partial (_) {

	return path.join(__dirname, "..", "..", "views", "partials", _);

}

(async () => {

	await db.init();
	
	contenu.routes.admin.get("/plugins/analytics", (req, res) => {

		if (req.query.path) {

			res.render(path.join(__dirname, "views", "path.ejs"), {

				partial,
				path: req.query.path,
				db

			});

		} else {

			res.render(path.join(__dirname, "views", "index.ejs"), {

				partial,

				db

			});

		}

	});

	contenu.routes.www.after((req, res) => {

		res.on("finish", async () => {

			if (res.statusCode === 200 || res.statusCode === 304) {

				const ip = req.connection.remoteAddress.replace("::ffff:", "");
				const location = await locate(ip);
	
				// console.log(ip, location, req.get("Referrer"), req.path);
				// console.log(req.path, res.getHeaders());

				// console.log("A");

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
