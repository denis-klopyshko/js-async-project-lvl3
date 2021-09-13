install:
	npm install

page-loader:
	node src/bin/page-loader --output /var/tmp https://ru.hexlet.io/courses

publish:
	npm publish --dry-run

lint:
	npx eslint .
