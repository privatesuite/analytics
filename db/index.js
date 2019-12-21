const path = require("path");
const Streamlet = require("streamletdb");

const db = new Streamlet(path.join(__dirname, "..", "database"));

module.exports = {

	init: () => db.init(),

	addHit (data = {

		path: "",
		date: "",
		origin: "",
		referrer: "",
		userAgent: "",
		contentType: "",

	}) {

		db.insert({

			type: "hit",

			...data

		});

	},

	getHits () {

		return db.find(_ => _.type === "hit");

	},

	// Paths

	getPaths () {

		const s = new Set();

		for (const _ of this.getHits()) s.add(_.path);

		return [...s];

	},

	getHitsForPath (path) {

		return this.getHits().filter(_ => _.path === path);

	},

	getViewsForPath (path) {

		return this.getHitsForPath(path).length;

	},

	getViewsForAllPaths () {

		return this.getPaths().map(_ => this.getViewsForPath(_));

	},
	
	// Pages

	getPages () {

		const s = new Set();

		for (const _ of this.getHits().filter(_ => _.contentType === "text/html")) s.add(_.path);

		return [...s];

	},

	getViewsForAllPages () {

		return this.getPages().map(_ => this.getViewsForPath(_));

	},

	getMostViewed () {

		let m = "";
		let m_ = 0;

		for (const g of this.getPaths()) {
			
			const v = this.getViewsForPath(g);
			if (v > m_) {

				m = g;
				m_ = v;

			}

		}

		return {

			path: m,
			views: m_

		}

	},

	// Countries

	getCountriesObject () {

		const f = {};

		for (const _ of this.getHits().filter(_ => _.contentType === "text/html")) f[_.origin.country || "Unknown"] = (f[_.origin.country || "Unknown"] || 0) + 1;

		return f;

	}

}
 