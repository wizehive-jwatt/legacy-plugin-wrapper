
import BigNumber from 'bignumber.js'

import Handlebars from 'handlebars'

import moment from 'moment'

import 'firebase'
import 'angularfire'

import showdown from 'showdown'
import 'ng-showdown'

import 'tinymce/tinymce'
import 'tinymce/plugins/autoresize/plugin'
import 'tinymce/plugins/paste/plugin'
import 'tinymce/plugins/link/plugin'
import 'tinymce/plugins/hr/plugin'
import 'tinymce/plugins/textcolor/plugin'
import 'tinymce/themes/modern/theme'
import 'angular-ui-tinymce'

import '../vendor/ace-builds-1.1.2/src-min-noconflict/ace.js'
import '../vendor/ace-builds-1.1.2/src-min-noconflict/theme-twilight'
import '../vendor/ace-builds-1.1.2/src-min-noconflict/mode-xml'
import 'angular-ui-ace/src/ui-ace'

import '../vendor/bootstrap.js'
import 'angular-bootstrap'
import '../vendor/validators.js'

import 'ui-select'

import plugin from './lib/wrapper'
import { Services } from './lib/services'
import { Filters } from './lib/filters'
import { Directives } from './lib/directives'
import { ZnForm } from './lib/zn-form'
import { ZnData } from './lib/zn-data'

Services(plugin)
Filters(plugin)
Directives(plugin)
ZnForm(plugin)
ZnData(plugin)

/* PLUGIN_JS */
