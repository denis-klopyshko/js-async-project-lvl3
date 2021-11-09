install:
	npm install

page-loader:
	 DEBUG=page-loader:* node src/bin/page-loader -o /Users/denis.klopyshko/Documents/async https://guides.hexlet.io/

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	DEBUG=nock.scope:* npm test
