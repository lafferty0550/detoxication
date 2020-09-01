const {src, dest} = require('gulp');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const argv = require('yargs').argv;
const rimraf = require('rimraf');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const gulpEmpty = require('gulp-empty');
const imagemin = require('gulp-imagemin');
const ttf2woff = require('gulp-ttf2woff');
const ghPages = require('gulp-gh-pages');

const production = argv.production;

const _dist = `dist`;
const _src = `src`;

const path = {
    build: {
        html: `${_dist}/`,
        css: `${_dist}/css/`,
        img: `${_dist}/img/`,
        fonts: `${_dist}/fonts/`,
    },
    src: {
        html: [`${_src}/*.html`, `!${_src}/_*.html`],
        less: `${_src}/less/index.less`,
        img: `${_src}/img/**/*`,
        fonts: `${_src}/fonts/*.ttf`,
    },
    watch: {
        html: `${_src}/**/*.html`,
        css: `${_src}/less/**/*.less`,
        img: `${_src}/img/**/*.{svg}`
    },
    clean: `./${_dist}/`
};

/*gulp.task('deploy', () => src(`${_dist}/!**!/!*`).pipe(ghPages({
    remoteUrl: 'https://github.com/lafferty0550/detoxication.git',
    branch: 'gh-pages'
})));*/

const browserSync = () => {
    browsersync.init({
        server: {
            baseDir: _dist
        },
        port: 3000,
        notify: false
    });
};

const html = () => {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
};

const css = () => {
    return src(path.src.less)
        .pipe(less())
        .pipe(groupMedia())
        .pipe(autoprefixer())
        .pipe(!production ? cleanCSS() : gulpEmpty())
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
};

const images = () => {
    return src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
};

const fonts = () => {
    return src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
};

const watchFiles = () => {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.img], images);
};

const clean = (cb) => {
    rimraf(path.clean, () => {
        console.log('Dist folder was deleted');
        cb();
    });
};

const build = gulp.series(clean, gulp.parallel(html, css, images, fonts));

let tasks = [build];
if (!production)
    tasks = [...tasks, watchFiles, browserSync];
const watch = gulp.parallel(tasks);

exports.html = html;
exports.css = css;
exports.images = images;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.default = watch;