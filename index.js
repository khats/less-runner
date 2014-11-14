var less = require('less'),
    fs = require('fs'),
    Features = require('less-features'),
    parser = less.Parser(),
    logger;

function Runner(config, _logger) {
    config = config || {};
    logger = _logger || console;

    this._path = config.path || '.';
    this._options = config.options || {};
    this._env = config.env || 'default';
    this._list = getFeaturesList(this._path + '/config.json', this._env);
    fs.watchFile(this._path + '/config.json', update(this));

    function getFeaturesList(path, env) { logger.info('Получаем список активных фич:'); //!!!

        var config = JSON.parse(fs.readFileSync(path, {
            encoding: 'utf-8'
        }));

        logger.info(config[env]); //!!!
        return config[env];
    }

    function update(self) {

        return function() {
            logger.info(self._list);
            self._list = getFeaturesList(self._path + '/config.json', self._env);
        };

    }

    logger.info('Копия Runner создана:', this); //!!!
}

function toCSS(err, data) {
    var options = require('./config');

    if (err) {
        logger.info(err) && logger.error(err);
        return;
    }

    logger.info('Стили успешно спарсены');

    options.plugins = [new Features(less.tree, this._list)];

    logger.info('Опции для генерации стилей:' + "\n", options);

    this._res.end(data.toCSS(options));
}

Runner.prototype = {

    run: function(req, res) {
        var file = req.originalUrl.replace(/(.+)\.css(?:\?.+)?/, '.$1.less');

        logger.info('Читаем less файл по пути ' + file + ' для запуска компиляции');


        this._res = res;

        fs.readFile(file, this._options, this.parse.bind(this));
    },

    parse: function(err, code) {

        if (err) {
            logger.info('Ошибка чтения файла', err) && logger.error(err);
            return;
        }

        logger.info('Файл успешно прочитан');
        parser.parse(code, toCSS.bind(this));
    }

};

module.exports = Runner;
