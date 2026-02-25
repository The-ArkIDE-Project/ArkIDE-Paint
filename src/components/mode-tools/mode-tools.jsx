/* eslint-disable no-case-declarations */
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import Dropdown from '../dropdown/dropdown.jsx';
import MediaQuery from 'react-responsive';
import layout from '../../lib/layout-constants';

import { changeBrushSize, changeSimplifySize, setBrushType } from '../../reducers/brush-mode';
import { changeBrushSize as changeEraserSize, changeSimplifySize as changeEraserSimplifySize } from '../../reducers/eraser-mode';
import { changeSimplifySize as changePenSimplifySize } from '../../reducers/pen-mode';
import { changeRoundedRectCornerSize } from '../../reducers/rounded-rect-mode';
import { changeRoundedCornerSize } from '../../reducers/rect-mode';
import { changeTrianglePolyCount, changeTrianglePointCount } from '../../reducers/triangle-mode';
import { changeCurrentlySelectedShape } from '../../reducers/sussy-mode';
import { changeBitBrushSize } from '../../reducers/bit-brush-size';
import { changeBitEraserSize } from '../../reducers/bit-eraser-size';
import { setShapesFilled } from '../../reducers/fill-bitmap-shapes';
import { setTextAlignment } from '../../reducers/text-alignment';

import FontDropdown from '../../containers/font-dropdown.jsx';
import LiveInputHOC from '../forms/live-input-hoc.jsx';
import Label from '../forms/label.jsx';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Input from '../forms/input.jsx';
import InputGroup from '../input-group/input-group.jsx';
import ButtonGroup from '../button-group/button-group.jsx';
import Button from '../button/button.jsx';
import LabeledIconButton from '../labeled-icon-button/labeled-icon-button.jsx';
import Modes from '../../lib/modes';
import Formats, { isBitmap, isVector } from '../../lib/format';
import { hideLabel } from '../../lib/hide-label';
import styles from './mode-tools.css';
import { MAX_STROKE_WIDTH } from '../../reducers/stroke-width';
import {
    getAllShapes as sussyToolShapes,
    categories as sussyToolCategories,
    generateShapeSVG as generateSussyShapeSVG,
    categorizeShapes as categorizeSussyShapes,
    addFontAwesomeShape,
    removeFontAwesomeShape,
} from '../../helper/selectable-shapes.js';

import copyIcon from './icons/copy.svg';
import cutIcon from './icons/cut.svg';
import pasteIcon from './icons/paste.svg';
import deleteIcon from './icons/delete.svg';
import roundLine from './icons/round-line.svg';
import squareLine from './icons/square-line.svg';
import miterLineJoin from './icons/miter-line-join.svg';
import roundLineJoin from './icons/round-line-join.svg';
import bevelLineJoin from './icons/bevel-line-join.svg';
import shapeMergeIcon from './icons/merge.svg';
import shapeMaskIcon from './icons/mask.svg';
import shapeSubtractIcon from './icons/subtract.svg';
import shapeFilterIcon from './icons/filter.svg';
import alignLeftIcon from './icons/alignLeft.svg';
import alignRightIcon from './icons/alignRight.svg';
import alignCenterIcon from './icons/alignCenter.svg';
import bitBrushIcon from '../bit-brush-mode/brush.svg';
import bitEraserIcon from '../bit-eraser-mode/eraser.svg';
import bitLineIcon from '../bit-line-mode/line.svg';
import brushIcon from '../brush-mode/brush.svg';
import curvedPointIcon from './icons/curved-point.svg';
import eraserIcon from '../eraser-mode/eraser.svg';
import roundedRectIcon from '../rounded-rect-mode/rounded-rectangle.svg';
import triangleIcon from '../triangle-mode/triangle.svg';
import triangleSpikeRatioIcon from './icons/triangle-spike-ratio.svg';
import flipHorizontalIcon from './icons/flip-horizontal.svg';
import flipVerticalIcon from './icons/flip-vertical.svg';
import centerSelectionIcon from './icons/centerSelection.svg';
import straightPointIcon from './icons/straight-point.svg';
import bitOvalIcon from '../bit-oval-mode/oval.svg';
import bitRectIcon from '../bit-rect-mode/rectangle.svg';
import bitOvalOutlinedIcon from '../bit-oval-mode/oval-outlined.svg';
import bitRectOutlinedIcon from '../bit-rect-mode/rectangle-outlined.svg';

const FA_API_BASE = 'https://api.fontawesome.com';

const searchFontAwesomeIcons = async (query) => {
    try {
        const gql = `
            query {
              search(version:"6.x", query:"${query.replace(/"/g, '')}", first:20) {
                id
                label
                svgPathData(style:SOLID)
                viewBox
              }
            }
        `;
        const res = await fetch(FA_API_BASE + '/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: gql }),
        });
        if (!res.ok) throw new Error('FA API error');
        const json = await res.json();
        const results = (json.data && json.data.search) ? json.data.search : [];
        return results.map(icon => ({
            id: `fa-${icon.id}`,
            name: icon.label,
            path: icon.svgPathData,
            viewBox: icon.viewBox || '0 0 512 512',
        }));
    } catch (_) {
        // Graceful offline fallback — a small curated set
        return FALLBACK_FA_ICONS.filter(i =>
            i.name.toLowerCase().includes(query.toLowerCase()) ||
            i.id.includes(query.toLowerCase())
        );
    }
};

// Curated fallback icons (solid style paths from FA 6 free)
const FALLBACK_FA_ICONS = [
    { id: 'fa-star', name: 'Star', viewBox: '0 0 576 512', path: 'M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z' },
    { id: 'fa-heart', name: 'Heart', viewBox: '0 0 512 512', path: 'M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z' },
    { id: 'fa-house', name: 'House', viewBox: '0 0 576 512', path: 'M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z' },
    { id: 'fa-circle-check', name: 'Circle Check', viewBox: '0 0 512 512', path: 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z' },
    { id: 'fa-circle-xmark', name: 'Circle X', viewBox: '0 0 512 512', path: 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z' },
    { id: 'fa-user', name: 'User', viewBox: '0 0 448 512', path: 'M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z' },
    { id: 'fa-envelope', name: 'Envelope', viewBox: '0 0 512 512', path: 'M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z' },
    { id: 'fa-bell', name: 'Bell', viewBox: '0 0 448 512', path: 'M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 512c12.7 0 24.8-3.9 35-10.7c5.3-3.5 9.8-8.2 13.2-13.6H175.8c3.4 5.4 7.9 10.1 13.2 13.6C199.2 508.1 211.3 512 224 512z' },
    { id: 'fa-magnifying-glass', name: 'Magnifying Glass', viewBox: '0 0 512 512', path: 'M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z' },
    { id: 'fa-gear', name: 'Gear (FA)', viewBox: '0 0 512 512', path: 'M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z' },
    { id: 'fa-flag', name: 'Flag', viewBox: '0 0 448 512', path: 'M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z' },
    { id: 'fa-bolt', name: 'Bolt (FA)', viewBox: '0 0 448 512', path: 'M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288H175.8L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7H272.2L349.4 44.6z' },
    { id: 'fa-camera', name: 'Camera', viewBox: '0 0 512 512', path: 'M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 384a96 96 0 1 1 0-192 96 96 0 1 1 0 192z' },
    { id: 'fa-music', name: 'Music', viewBox: '0 0 512 512', path: 'M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7V168c0 23.4-18.2 42.4-41.4 43.9L186.7 232c-14.1 .9-24.7 12.9-24.7 27v24.3c0 12.3 7.7 23.1 19.2 27.2L448 400.8V400c0 44.2-35.8 80-80 80s-80-35.8-80-80s35.8-80 80-80c3.3 0 6.5 .2 9.7 .6L116.1 239.4C85.8 228.2 64 199.3 64 165.7V152.3C64 122.4 79.9 96 105.1 83.2L449.8 .9c10.5-5.1 22.8-4.6 32.9 1.4c1.4 .8 2.7 1.7 3.9 2.6c.1 .1 .2 .2 .3 .3c.1 .1 .1 .2 .2 .2c.1 .1 .1 .2 .2 .3z' },
    { id: 'fa-trash', name: 'Trash', viewBox: '0 0 448 512', path: 'M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z' },
    { id: 'fa-pen', name: 'Pen', viewBox: '0 0 512 512', path: 'M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z' },
];

// ─── Font Awesome Search Panel Component ─────────────────────────────────────

class FontAwesomeSearchPanel extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            query: '',
            results: [],
            loading: false,
            error: null,
            addedIds: new Set(),
        };
        this._searchTimer = null;
        this._handleQueryChange = this._handleQueryChange.bind(this);
        this._doSearch = this._doSearch.bind(this);
    }

    componentDidMount () {
        // Show the curated fallback list right away so it's not empty
        this.setState({ results: FALLBACK_FA_ICONS.slice(0, 12) });
    }

    _handleQueryChange (e) {
        const query = e.target.value;
        this.setState({ query });
        clearTimeout(this._searchTimer);
        if (!query.trim()) {
            this.setState({ results: FALLBACK_FA_ICONS.slice(0, 12), error: null });
            return;
        }
        this._searchTimer = setTimeout(this._doSearch, 400);
    }

    async _doSearch () {
        const { query } = this.state;
        if (!query.trim()) return;
        this.setState({ loading: true, error: null });
        try {
            const results = await searchFontAwesomeIcons(query);
            this.setState({ results, loading: false });
        } catch (err) {
            this.setState({ loading: false, error: 'Search failed' });
        }
    }

    render () {
        const { onAddIcon, onRemoveIcon } = this.props;
        const { query, results, loading, addedIds } = this.state;

        return (
            <div style={{
                padding: '8px',
                minWidth: '220px',
                maxWidth: '280px',
                borderTop: '1px solid #d9d9d9',
                marginTop: '4px',
            }}>
                <p style={{
                    margin: '0 0 6px 0',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#575e75',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    Font Awesome Icons
                </p>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={this._handleQueryChange}
                        placeholder="Search icons…"
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '5px 8px',
                            border: '1px solid #c8c8c8',
                            borderRadius: '4px',
                            fontSize: '12px',
                            outline: 'none',
                            color: '#575e75',
                        }}
                    />
                    {loading && (
                        <span style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '10px',
                            color: '#888',
                        }}>…</span>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                }}>
                    {results.length === 0 && !loading && (
                        <span style={{ fontSize: '11px', color: '#aaa', padding: '4px' }}>
                            No results
                        </span>
                    )}
                    {results.map(icon => {
                        const isAdded = addedIds.has(icon.id);
                        const svgDataUri = `data:image/svg+xml,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox || '0 0 512 512'}">` +
                            `<path d="${icon.path}" fill="#575e75"/></svg>`
                        )}`;
                        return (
                            <div
                                key={icon.id}
                                title={`${icon.name}${isAdded ? ' (added — click to remove)' : ' (click to add)'}`}
                                onClick={() => {
                                    if (isAdded) {
                                        removeFontAwesomeShape(icon.id);
                                        const next = new Set(addedIds);
                                        next.delete(icon.id);
                                        this.setState({ addedIds: next });
                                        if (onRemoveIcon) onRemoveIcon(icon.id);
                                    } else {
                                        addFontAwesomeShape(icon.id, icon.name, icon.path, icon.viewBox || '0 0 512 512');
                                        const next = new Set(addedIds);
                                        next.add(icon.id);
                                        this.setState({ addedIds: next });
                                        if (onAddIcon) onAddIcon(icon.id);
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '44px',
                                    padding: '4px 2px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    border: `1.5px solid ${isAdded ? '#4c97ff' : 'transparent'}`,
                                    background: isAdded ? '#e8f0ff' : 'transparent',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => {
                                    if (!isAdded) e.currentTarget.style.background = '#f0f0f0';
                                }}
                                onMouseLeave={e => {
                                    if (!isAdded) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <img
                                    src={svgDataUri}
                                    alt={icon.name}
                                    width={20}
                                    height={20}
                                    draggable={false}
                                    style={{ display: 'block' }}
                                />
                                <span style={{
                                    fontSize: '8px',
                                    color: '#575e75',
                                    marginTop: '2px',
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {icon.name}
                                </span>
                                {isAdded && (
                                    <span style={{ fontSize: '8px', color: '#4c97ff', fontWeight: 'bold' }}>✓</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '9px', color: '#aaa' }}>
                    Font Awesome Free 6 · Click icon to add/remove
                </p>
            </div>
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────

const LiveInput = LiveInputHOC(Input);
const ModeToolsComponent = props => {
    const messages = defineMessages({
        brushSize: {
            defaultMessage: 'Size',
            description: 'Label for the brush size input',
            id: 'paint.modeTools.brushSize'
        },
        brushSimplify: {
            defaultMessage: 'Smoothing',
            description: 'Label for the brush smoothing input, higher numbers control how much the drawn line will be corrected',
            id: 'paint.modeTools.brushSimplify'
        },
        eraserSize: {
            defaultMessage: 'Eraser size',
            description: 'Label for the eraser size input',
            id: 'paint.modeTools.eraserSize'
        },
        eraserSimplify: {
            defaultMessage: 'Smoothing',
            description: 'Label for the eraser smoothing input, higher numbers control how much the drawn line will be corrected',
            id: 'paint.modeTools.eraserSimplify'
        },
        brushCircle: {
            defaultMessage: 'Circle Brush',
            description: 'Label for the circle brush shape',
            id: 'paint.modeTools.circleSquare'
        },
        brushSquare: {
            defaultMessage: 'Square Brush',
            description: 'Label for the square brush shape',
            id: 'paint.modeTools.brushSquare'
        },
        roundedCornerSize: {
            defaultMessage: 'Rounded corner size',
            description: 'Label for the Rounded corner size input',
            id: 'paint.modeTools.roundedCornerSize'
        },
        currentSideCount: {
            defaultMessage: 'Polygon side count',
            description: 'Label for the Polygon side count input',
            id: 'paint.modeTools.currentSideCount'
        },
        spokeRatio: {
            defaultMessage: 'Star spoke ratio',
            description: 'Label for the Star spoke ratio input, controls the size of the spokes on a star',
            id: 'paint.modeTools.spikeRatio'
        },
        penSimplify: {
            defaultMessage: 'Smoothing',
            description: 'Label for the pen smoothing input, higher numbers control how much the drawn line will be corrected',
            id: 'paint.modeTools.penSimplify'
        },
        copy: {
            defaultMessage: 'Copy',
            description: 'Label for the copy button',
            id: 'paint.modeTools.copy'
        },
        cut: {
            defaultMessage: 'Cut',
            description: 'Label for the cut button',
            id: 'paint.modeTools.cut'
        },
        paste: {
            defaultMessage: 'Paste',
            description: 'Label for the paste button',
            id: 'paint.modeTools.paste'
        },
        delete: {
            defaultMessage: 'Delete',
            description: 'Label for the delete button',
            id: 'paint.modeTools.delete'
        },
        curved: {
            defaultMessage: 'Curved',
            description: 'Label for the button that converts selected points to curves',
            id: 'paint.modeTools.curved'
        },
        pointed: {
            defaultMessage: 'Pointed',
            description: 'Label for the button that converts selected points to sharp points',
            id: 'paint.modeTools.pointed'
        },
        thickness: {
            defaultMessage: 'Thickness',
            description: 'Label for the number input to choose the line thickness',
            id: 'paint.modeTools.thickness'
        },
        flipHorizontal: {
            defaultMessage: 'Flip Horizontal',
            description: 'Label for the button to flip the image horizontally',
            id: 'paint.modeTools.flipHorizontal'
        },
        flipVertical: {
            defaultMessage: 'Flip Vertical',
            description: 'Label for the button to flip the image vertically',
            id: 'paint.modeTools.flipVertical'
        },
        filled: {
            defaultMessage: 'Filled',
            description: 'Label for the button that sets the bitmap rectangle/oval mode to draw outlines',
            id: 'paint.modeTools.filled'
        },
        outlined: {
            defaultMessage: 'Outlined',
            description: 'Label for the button that sets the bitmap rectangle/oval mode to draw filled-in shapes',
            id: 'paint.modeTools.outlined'
        },
        movementCenter: {
            defaultMessage: 'Center',
            description: 'Label for the button that moves the selected objects to the center of the canvas',
            id: 'paint.modeTools.movementCenter'
        },
        joinSpiked: {
            defaultMessage: 'Spiked',
            description: 'Label for the button that sets the line join to miter',
            id: 'pm.paint.modeTools.joinSpiked'
        },
        joinRounded: {
            defaultMessage: 'Rounded',
            description: 'Label for the button that sets the line join to round',
            id: 'pm.paint.modeTools.joinRounded'
        },
        joinBeveled: {
            defaultMessage: 'Beveled',
            description: 'Label for the button that sets the line join to bevel',
            id: 'pm.paint.modeTools.joinBeveled'
        },
        endRounded: {
            defaultMessage: 'Rounded',
            description: 'Label for the button that sets the line cap to round',
            id: 'pm.paint.modeTools.endRounded'
        },
        endSquared: {
            defaultMessage: 'Squared',
            description: 'Label for the button that sets the line cap to square',
            id: 'pm.paint.modeTools.endSquared'
        },
        merge: {
            defaultMessage: 'Merge',
            description: 'Label for the button that merges two selected objects together',
            id: 'pm.paint.modeTools.merge'
        },
        subtract: {
            defaultMessage: 'Subtract',
            description: 'Label for the button that subtracts selected objects from eachother',
            id: 'pm.paint.modeTools.subtract'
        },
        mask: {
            defaultMessage: 'Mask',
            description: 'Label for the button that ands two selected objects together',
            id: 'pm.paint.modeTools.mask'
        },
        filter: {
            defaultMessage: 'Filter',
            description: 'Label for the button that xors two selected objects together',
            id: 'pm.paint.modeTools.filter'
        },
        leftAlign: {
            defaultMessage: 'Left Align',
            description: 'Label for the button that sets text alignment to the left',
            id: 'pm.paint.modeTools.leftAlign'
        },
        rightAlign: {
            defaultMessage: 'Right Align',
            description: 'Label for the button that sets text alignment to the right',
            id: 'pm.paint.modeTools.rightAlign'
        },
        centerAlign: {
            defaultMessage: 'Center Align',
            description: 'Label for the button that sets text alignment to the center',
            id: 'pm.paint.modeTools.centerAlign'
        }
    });

    switch (props.mode) {
        case Modes.BRUSH:
        /* falls through */
        case Modes.BIT_BRUSH:
        /* falls through */
        case Modes.BIT_LINE:
            {
                const currentIcon = isVector(props.format) ? brushIcon :
                    props.mode === Modes.BIT_LINE ? bitLineIcon : bitBrushIcon;
                const currentBrushValue = isBitmap(props.format) ? props.bitBrushSize : props.brushValue;
                const currentSimplifyValue = props.simplifyValue;
                const changeFunction = isBitmap(props.format) ? props.onBitBrushSliderChange : props.onBrushSliderChange;
                const changeFunctionSimplify = props.onSimplifySliderChange;
                const currentMessage = props.mode === Modes.BIT_LINE ? messages.thickness : messages.brushSize;
                const hasSimplifyOption = props.mode === Modes.BRUSH;
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <div>
                            <img
                                alt={props.intl.formatMessage(currentMessage)}
                                title={props.intl.formatMessage(currentMessage)}
                                className={styles.modeToolsIcon}
                                draggable={false}
                                src={currentIcon}
                            />
                        </div>
                        <LiveInput
                            range
                            small
                            max={MAX_STROKE_WIDTH}
                            min="1"
                            type="number"
                            value={currentBrushValue}
                            onSubmit={changeFunction}
                        />
                        
                        {hasSimplifyOption && (
                            <Label text={props.intl.formatMessage(messages.brushSimplify)} style={{ marginLeft: 'calc(2 * .25rem)' }}>
                                <LiveInput
                                    range
                                    small
                                    max={1000}
                                    min="0"
                                    type="number"
                                    value={currentSimplifyValue}
                                    onSubmit={changeFunctionSimplify}
                                />
                            </Label>
                        )}

                        {/* TODO replace this with a dropdown when we add more brush shapes */}
                        {hasSimplifyOption && (
                            <InputGroup>
                                <ButtonGroup>
                                    <Button
                                        className={
                                            classNames(styles.buttonGroupButton)
                                        }
                                        onClick={() => props.onBrushChange("CIRCLE")}
                                    >
                                        <img
                                            alt={props.intl.formatMessage(messages.brushCircle)}
                                            className={styles.buttonGroupButtonIcon}
                                            draggable={false}
                                            src={"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDBjM2ZmIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHJ4PSIxMDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIuNSAyLjUpIi8+PC9zdmc+"}
                                        />
                                    </Button>
                                    <Button
                                        className={
                                            classNames(styles.buttonGroupButton)
                                        }
                                        onClick={() => props.onBrushChange("SQUARE")}
                                    >
                                        <img
                                            alt={props.intl.formatMessage(messages.brushSquare)}
                                            className={styles.buttonGroupButtonIcon}
                                            draggable={false}
                                            src={"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDBjM2ZmIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHJ4PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLjUgMi41KSIvPjwvc3ZnPg=="}
                                        />
                                    </Button>
                                </ButtonGroup>
                            </InputGroup>
                        )}
                    </div>
                );
            }
        case Modes.BIT_ERASER:
        /* falls through */
        case Modes.ERASER:
            {
                const currentIcon = isVector(props.format) ? eraserIcon : bitEraserIcon;
                const currentEraserValue = isBitmap(props.format) ? props.bitEraserSize : props.eraserValue;
                const currentEraserSimplifyValue = props.eraserSimplifyValue;
                const changeFunction = isBitmap(props.format) ? props.onBitEraserSliderChange : props.onEraserSliderChange;
                const changeFunctionSimplify = props.onEraserSimplifySliderChange;
                const hasSimplifyOption = props.mode === Modes.ERASER;
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <div>
                            <img
                                alt={props.intl.formatMessage(messages.eraserSize)}
                                title={props.intl.formatMessage(messages.eraserSize)}
                                className={styles.modeToolsIcon}
                                draggable={false}
                                src={currentIcon}
                            />
                        </div>
                        <LiveInput
                            range
                            small
                            max={MAX_STROKE_WIDTH}
                            min="1"
                            type="number"
                            value={currentEraserValue}
                            onSubmit={changeFunction}
                        />

                        {hasSimplifyOption && (
                            <Label text={props.intl.formatMessage(messages.eraserSimplify)} style={{ marginLeft: 'calc(2 * .25rem)' }}>
                                <LiveInput
                                    range
                                    small
                                    max={1000}
                                    min="0"
                                    type="number"
                                    value={currentEraserSimplifyValue}
                                    onSubmit={changeFunctionSimplify}
                                />
                            </Label>
                        )}

                        {/* TODO replace this with a dropdown when we add more brush shapes */}
                        {hasSimplifyOption && (
                            <InputGroup>
                                <ButtonGroup>
                                    <Button
                                        className={
                                            classNames(styles.buttonGroupButton)
                                        }
                                        onClick={() => props.onBrushChange("CIRCLE")}
                                    >
                                        <img
                                            alt={props.intl.formatMessage(messages.brushCircle)}
                                            className={styles.buttonGroupButtonIcon}
                                            draggable={false}
                                            src={"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDBjM2ZmIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHJ4PSIxMDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIuNSAyLjUpIi8+PC9zdmc+"}
                                        />
                                    </Button>
                                    <Button
                                        className={
                                            classNames(styles.buttonGroupButton)
                                        }
                                        onClick={() => props.onBrushChange("SQUARE")}
                                    >
                                        <img
                                            alt={props.intl.formatMessage(messages.brushSquare)}
                                            className={styles.buttonGroupButtonIcon}
                                            draggable={false}
                                            src={"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDBjM2ZmIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHJ4PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLjUgMi41KSIvPjwvc3ZnPg=="}
                                        />
                                    </Button>
                                </ButtonGroup>
                            </InputGroup>
                        )}
                    </div>
                )
            }
        case Modes.ROUNDED_RECT:
        /* falls through */
        case Modes.RECT:
            {
                // NOTE: BIT_RECT doesnt use Path, so this can't be added there the same way as RECT has it.
                const currentCornerValue = props.mode === Modes.ROUNDED_RECT ? props.roundedRectCornerValue : props.roundedCornerValue;
                const changeFunction = props.mode === Modes.ROUNDED_RECT ? props.onRoundedRectCornerSliderChange : props.onRoundedCornerSliderChange;
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <div>
                            <img
                                alt={props.intl.formatMessage(messages.roundedCornerSize)}
                                title={props.intl.formatMessage(messages.roundedCornerSize)}
                                className={styles.modeToolsIcon}
                                draggable={false}
                                src={roundedRectIcon}
                            />
                        </div>
                        <LiveInput
                            range
                            small
                            min={0}
                            max={1000}
                            type="number"
                            value={currentCornerValue}
                            onSubmit={changeFunction}
                        />
                    </div>
                );
            }
        case Modes.TRIANGLE:
            {
                const currentSideValue = props.trianglePolyValue;
                const currentPointValue = props.trianglePointValue;
                const changeFunction = props.onPolyCountSliderChange;
                const changeFunctionPoint = props.onPointCountSliderChange;
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <div>
                            <img
                                alt={props.intl.formatMessage(messages.currentSideCount)}
                                title={props.intl.formatMessage(messages.currentSideCount)}
                                className={styles.modeToolsIcon}
                                draggable={false}
                                src={triangleIcon}
                            />
                        </div>
                        <LiveInput
                            range
                            small
                            max={1000}
                            min="3"
                            type="number"
                            value={currentSideValue}
                            onSubmit={changeFunction}
                        />
                        <div>
                            <img
                                alt={props.intl.formatMessage(messages.spokeRatio)}
                                title={props.intl.formatMessage(messages.spokeRatio)}
                                className={styles.modeToolsIcon}
                                draggable={false}
                                src={triangleSpikeRatioIcon}
                            />
                        </div>
                        <LiveInput
                            range
                            small
                            max={1000}
                            min="0" // Spike ratio is limited to 0.01, but setting that here makes the number input arrows work really ugly
                            step="0.1"
                            type="number"
                            value={currentPointValue}
                            onSubmit={changeFunctionPoint}
                        />
                    </div>
                );
            }
        case Modes.SUSSY:
            {
                const currentlySelectedShape = props.currentlySelectedShape;
                const changeFunction = props.onCurrentlySelectedShapeChange;
                const allShapes = sussyToolShapes();
                const selectedShapeObject = allShapes
                    .filter(shape => shape.id === currentlySelectedShape)[0];
                const categorizedShapes = categorizeSussyShapes(allShapes);
                const selectableShapesList = (
                    <InputGroup
                        className={classNames(
                            styles.modDashedBorder,
                            styles.dropItemShapeToolMenu,
                            styles.dropdownMaxItemList
                        )}
                    >
                        {Object.keys(categorizedShapes).map(categoryId => categorizedShapes[categoryId].length === 0 ?
                            (<React.Fragment key={categoryId} />) : (<React.Fragment key={categoryId}>
                                <p className={classNames(styles.dropItemShapeToolLabel)}>
                                    {sussyToolCategories[categoryId]}
                                </p>
                                {categorizedShapes[categoryId].map(shape => (
                                    <LabeledIconButton
                                        key={shape.id}
                                        className={classNames(styles.dropItemShapeTool)}
                                        hideLabel={hideLabel(props.intl.locale)}
                                        imgSrc={`data:image/svg+xml,${encodeURIComponent(generateSussyShapeSVG(shape))}`}
                                        title={shape.name}
                                        onClick={() => changeFunction(shape.id)}
                                    />
                                ))}
                        </React.Fragment>))}

                        <FontAwesomeSearchPanel
                            onAddIcon={(_id) => {
                            }}
                            onRemoveIcon={(_id) => {
                                if (_id === currentlySelectedShape) {
                                    changeFunction(allShapes[0].id);
                                }
                            }}
                        />
                    </InputGroup>
                );
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <Dropdown
                            className={styles.modUnselect}
                            enterExitTransitionDurationMs={20}
                            popoverContent={
                                <InputGroup
                                    className={styles.modContextMenu}
                                    rtl={props.rtl}
                                >
                                    {selectableShapesList}
                                </InputGroup>
                            }
                            tipSize={.01}
                        >
                            <img
                                src={`data:image/svg+xml,${encodeURIComponent(generateSussyShapeSVG(selectedShapeObject))}`}
                                alt={selectedShapeObject.name}
                                title={selectedShapeObject.name}
                                height={16}
                            />
                        </Dropdown>
                    </div>
                );
            }
        case Modes.PEN:
            {
                const currentPenSimplifyValue = props.penSimplifyValue;
                const changeFunctionSimplify = props.onPenSimplifySliderChange;
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <Label text={props.intl.formatMessage(messages.eraserSimplify)} style={{ marginLeft: 'calc(2 * .25rem)' }}>
                            <LiveInput
                                range
                                small
                                max={1000}
                                min="0"
                                type="number"
                                value={currentPenSimplifyValue}
                                onSubmit={changeFunctionSimplify}
                            />
                        </Label>
                    </div>
                );
            }
        case Modes.RESHAPE:
            const lineJoinReshape = (
                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        disabled={props.hasSelectedMiterLineJoin}
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={miterLineJoin}
                        title={props.intl.formatMessage(messages.joinSpiked)}
                        onClick={props.onMiterLineJoin}
                    />
                    <LabeledIconButton
                        disabled={props.hasSelectedRoundLineJoin}
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={roundLineJoin}
                        title={props.intl.formatMessage(messages.joinRounded)}
                        onClick={props.onRoundLineJoin}
                    />
                    <LabeledIconButton
                        disabled={props.hasSelectedBevelLineJoin}
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={bevelLineJoin}
                        title={props.intl.formatMessage(messages.joinBeveled)}
                        onClick={props.onBevelLineJoin}
                    />
                </InputGroup>
            );
            const deleteSelectedNodes = (
                <InputGroup className={classNames(styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={deleteIcon}
                        title={props.intl.formatMessage(messages.delete)}
                        onClick={props.onDelete}
                    />
                </InputGroup>
            );
            return (
                <div className={classNames(props.className, styles.modeTools)}>
                    <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                        <LabeledIconButton
                            disabled={!props.hasSelectedUncurvedPoints}
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={curvedPointIcon}
                            title={props.intl.formatMessage(messages.curved)}
                            onClick={props.onCurvePoints}
                        />
                        <LabeledIconButton
                            disabled={!props.hasSelectedUnpointedPoints}
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={straightPointIcon}
                            title={props.intl.formatMessage(messages.pointed)}
                            onClick={props.onPointPoints}
                        />
                    </InputGroup>
                    <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                        <LabeledIconButton
                            disabled={props.hasSelectedRoundEnds}
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={roundLine}
                            title={props.intl.formatMessage(messages.endRounded)}
                            onClick={props.onRoundEnds}
                        />
                        <LabeledIconButton
                            disabled={props.hasSelectedSquareEnds}
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={squareLine}
                            title={props.intl.formatMessage(messages.endSquared)}
                            onClick={props.onSquareEnds}
                        />
                    </InputGroup>
                    <MediaQuery minWidth={layout.fullSizeEditorMinWidthExtraToolsCollapsed}>
                        {lineJoinReshape}
                        {deleteSelectedNodes}
                    </MediaQuery>
                    <MediaQuery maxWidth={layout.fullSizeEditorMinWidthExtraToolsCollapsed - 1}>
                        <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                            <Dropdown
                                className={styles.modUnselect}
                                enterExitTransitionDurationMs={20}
                                popoverContent={
                                    <InputGroup
                                        className={styles.modContextMenu}
                                        rtl={props.rtl}
                                    >
                                        {lineJoinReshape}
                                        {deleteSelectedNodes}
                                    </InputGroup>
                                }
                                tipSize={.01}
                            >
                                More
                            </Dropdown>
                        </InputGroup>
                    </MediaQuery>
                </div>
            );
        case Modes.BIT_SELECT:
        /* falls through */
        case Modes.SELECT:
            const reshapingMethods = props.format.startsWith("BITMAP") ? null : (
                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={shapeMergeIcon}
                        title={props.intl.formatMessage(messages.merge)}
                        onClick={props.onMergeShape}
                    />
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={shapeMaskIcon}
                        title={props.intl.formatMessage(messages.mask)}
                        onClick={props.onMaskShape}
                    />
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={shapeSubtractIcon}
                        title={props.intl.formatMessage(messages.subtract)}
                        onClick={props.onSubtractShape}
                    />
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={shapeFilterIcon}
                        title={props.intl.formatMessage(messages.filter)}
                        onClick={props.onExcludeShape}
                    />
                </InputGroup>
            );
            const flipOptions = (
                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={props.intl.locale !== 'en'}
                        imgSrc={flipHorizontalIcon}
                        title={props.intl.formatMessage(messages.flipHorizontal)}
                        onClick={props.onFlipHorizontal}
                    />
                    <LabeledIconButton
                        hideLabel={props.intl.locale !== 'en'}
                        imgSrc={flipVerticalIcon}
                        title={props.intl.formatMessage(messages.flipVertical)}
                        onClick={props.onFlipVertical}
                    />
                </InputGroup>
            );
            const movementOptions = (
                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={props.intl.locale !== 'en'}
                        imgSrc={centerSelectionIcon}
                        title={props.intl.formatMessage(messages.movementCenter)}
                        onClick={props.onCenterSelection}
                    />
                </InputGroup>
            );
            return (
                <div className={classNames(props.className, styles.modeTools)}>
                    <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                        <LabeledIconButton
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={copyIcon}
                            title={props.intl.formatMessage(messages.copy)}
                            onClick={props.onCopyToClipboard}
                        />
                        <LabeledIconButton
                            disabled={!(props.clipboardItems.length > 0)}
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={pasteIcon}
                            title={props.intl.formatMessage(messages.paste)}
                            onClick={props.onPasteFromClipboard}
                        />
                        <LabeledIconButton
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={cutIcon}
                            title={props.intl.formatMessage(messages.cut)}
                            onClick={props.onCutToClipboard}
                        />
                    </InputGroup>
                    <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                        <LabeledIconButton
                            hideLabel={hideLabel(props.intl.locale)}
                            imgSrc={deleteIcon}
                            title={props.intl.formatMessage(messages.delete)}
                            onClick={props.onDelete}
                        />
                    </InputGroup>
                    <MediaQuery minWidth={layout.fullSizeEditorMinWidthExtraToolsCollapsed}>
                        {/* Flip Options */}
                        {flipOptions}
                        {/* Movement Options */}
                        {movementOptions}
                        {/* Reshaping Methods */}
                        {(props.mode === Modes.SELECT) ? (
                            <MediaQuery minWidth={layout.fullSizeEditorMinWidthExtraTools}>
                                {reshapingMethods}
                            </MediaQuery>
                        ) : null}
                        {(props.mode === Modes.SELECT) ? (
                            <MediaQuery maxWidth={layout.fullSizeEditorMinWidthExtraTools - 1}>
                                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                                    <Dropdown
                                        className={styles.modUnselect}
                                        enterExitTransitionDurationMs={20}
                                        popoverContent={
                                            <InputGroup
                                                className={styles.modContextMenu}
                                                rtl={props.rtl}
                                            >
                                                {reshapingMethods}
                                            </InputGroup>
                                        }
                                        tipSize={.01}
                                    >
                                        More
                                    </Dropdown>
                                </InputGroup>
                            </MediaQuery>
                        ) : null}
                    </MediaQuery>
                    <MediaQuery maxWidth={layout.fullSizeEditorMinWidthExtraToolsCollapsed - 1}>
                        <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                            <Dropdown
                                className={styles.modUnselect}
                                enterExitTransitionDurationMs={20}
                                popoverContent={
                                    <InputGroup
                                        className={styles.modContextMenu}
                                        rtl={props.rtl}
                                    >
                                        {flipOptions}
                                        {movementOptions}
                                        {reshapingMethods}
                                    </InputGroup>
                                }
                                tipSize={.01}
                            >
                                More
                            </Dropdown>
                        </InputGroup>
                    </MediaQuery>
                </div>
            );
        case Modes.BIT_TEXT:
        /* falls through */
        case Modes.TEXT:
            return (
                <div className={classNames(props.className, styles.modeTools)}>
                    <InputGroup className={classNames(styles.modDashedBorder)}>
                        <FontDropdown
                            onUpdateImage={props.onUpdateImage}
                            onManageFonts={props.onManageFonts}
                        />
                    </InputGroup>
                    <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                        <LabeledIconButton
                            hideLabel
                            imgSrc={alignLeftIcon}
                            title={props.intl.formatMessage(messages.leftAlign)}
                            onClick={props.onTextAlignLeft}
                        />
                        <LabeledIconButton
                            hideLabel
                            imgSrc={alignCenterIcon}
                            title={props.intl.formatMessage(messages.centerAlign)}
                            onClick={props.onTextAlignCenter}
                        />
                        <LabeledIconButton
                            hideLabel
                            imgSrc={alignRightIcon}
                            title={props.intl.formatMessage(messages.rightAlign)}
                            onClick={props.onTextAlignRight}
                        />
                    </InputGroup>
                </div>
            );
        case Modes.BIT_RECT:
        /* falls through */
        case Modes.BIT_OVAL:
            {
                const fillIcon = props.mode === Modes.BIT_RECT ? bitRectIcon : bitOvalIcon;
                const outlineIcon = props.mode === Modes.BIT_RECT ? bitRectOutlinedIcon : bitOvalOutlinedIcon;
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <InputGroup>
                            <LabeledIconButton
                                highlighted={props.fillBitmapShapes}
                                imgSrc={fillIcon}
                                title={props.intl.formatMessage(messages.filled)}
                                onClick={props.onFillShapes}
                            />
                        </InputGroup>
                        <InputGroup>
                            <LabeledIconButton
                                highlighted={!props.fillBitmapShapes}
                                imgSrc={outlineIcon}
                                title={props.intl.formatMessage(messages.outlined)}
                                onClick={props.onOutlineShapes}
                            />
                        </InputGroup>
                        {props.fillBitmapShapes ? null : (
                            <InputGroup>
                                <Label text={props.intl.formatMessage(messages.thickness)}>
                                    <LiveInput
                                        range
                                        small
                                        max={MAX_STROKE_WIDTH}
                                        min="1"
                                        type="number"
                                        value={props.bitBrushSize}
                                        onSubmit={props.onBitBrushSliderChange}
                                    />
                                </Label>
                            </InputGroup>)
                        }
                    </div>
                );
            }
        case Modes.ARROW:
            {
                return (
                    <div className={classNames(props.className, styles.modeTools)}>
                        <span>{`Hold Alt + Shift to resize arrow tip`}</span>
                    </div>
                );
            }
        default:
            // Leave empty for now, if mode not supported
            return (
                <div className={classNames(props.className, styles.modeTools)} />
            );
    }
};

ModeToolsComponent.propTypes = {
    bitBrushSize: PropTypes.number,
    bitEraserSize: PropTypes.number,
    brushValue: PropTypes.number,
    simplifyValue: PropTypes.number,
    className: PropTypes.string,
    clipboardItems: PropTypes.arrayOf(PropTypes.array),
    eraserValue: PropTypes.number,
    eraserSimplifyValue: PropTypes.number,
    brushType: PropTypes.string,
    penSimplifyValue: PropTypes.number,
    roundedCornerValue: PropTypes.number,
    roundedRectCornerValue: PropTypes.number,
    trianglePolyValue: PropTypes.number,
    trianglePointValue: PropTypes.number,
    currentlySelectedShape: PropTypes.string,
    fillBitmapShapes: PropTypes.bool,
    format: PropTypes.oneOf(Object.keys(Formats)),
    hasSelectedUncurvedPoints: PropTypes.bool,
    hasSelectedUnpointedPoints: PropTypes.bool,
    intl: intlShape.isRequired,
    mode: PropTypes.string.isRequired,
    onBitBrushSliderChange: PropTypes.func.isRequired,
    onBitEraserSliderChange: PropTypes.func.isRequired,
    onBrushSliderChange: PropTypes.func.isRequired,
    onSimplifySliderChange: PropTypes.func.isRequired,
    onCopyToClipboard: PropTypes.func.isRequired,
    onCutToClipboard: PropTypes.func.isRequired,
    onCurvePoints: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEraserSliderChange: PropTypes.func,
    onBrushChange: PropTypes.func,
    onEraserSimplifySliderChange: PropTypes.func,
    onPenSimplifySliderChange: PropTypes.func,
    onFillShapes: PropTypes.func.isRequired,
    onFlipHorizontal: PropTypes.func.isRequired,
    onFlipVertical: PropTypes.func.isRequired,
    onCenterSelection: PropTypes.func.isRequired,
    onManageFonts: PropTypes.func,
    onOutlineShapes: PropTypes.func.isRequired,
    onPasteFromClipboard: PropTypes.func.isRequired,
    onPointPoints: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired,

    onMergeShape: PropTypes.func.isRequired,
    onMaskShape: PropTypes.func.isRequired,
    onSubtractShape: PropTypes.func.isRequired,
    onExcludeShape: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    mode: state.scratchPaint.mode,
    format: state.scratchPaint.format,
    fillBitmapShapes: state.scratchPaint.fillBitmapShapes,
    bitBrushSize: state.scratchPaint.bitBrushSize,
    bitEraserSize: state.scratchPaint.bitEraserSize,
    brushValue: state.scratchPaint.brushMode.brushSize,
    simplifyValue: state.scratchPaint.brushMode.simplifySize,
    clipboardItems: state.scratchPaint.clipboard.items,
    eraserValue: state.scratchPaint.eraserMode.brushSize,
    eraserSimplifyValue: state.scratchPaint.eraserMode.simplifySize,
    brushType: state.scratchPaint.brushType,
    penSimplifyValue: state.scratchPaint.penMode.simplifySize,
    roundedRectCornerValue: state.scratchPaint.roundedRectMode.roundedCornerSize,
    roundedCornerValue: state.scratchPaint.rectMode.roundedCornerSize,
    trianglePolyValue: state.scratchPaint.triangleMode.trianglePolyCount,
    trianglePointValue: state.scratchPaint.triangleMode.trianglePointCount,
    currentlySelectedShape: state.scratchPaint.sussyMode.shape
});
const mapDispatchToProps = dispatch => ({
    onBrushSliderChange: brushSize => {
        dispatch(changeBrushSize(brushSize));
    },
    onSimplifySliderChange: brushSize => {
        dispatch(changeSimplifySize(brushSize));
    },
    onRoundedRectCornerSliderChange: roundedCornerSize => {
        dispatch(changeRoundedRectCornerSize(roundedCornerSize));
    },
    onRoundedCornerSliderChange: roundedCornerSize => {
        dispatch(changeRoundedCornerSize(roundedCornerSize));
    },
    onPolyCountSliderChange: polyCount => {
        dispatch(changeTrianglePolyCount(polyCount));
    },
    onPointCountSliderChange: polyCount => {
        dispatch(changeTrianglePointCount(polyCount));
    },
    onCurrentlySelectedShapeChange: shape => {
        dispatch(changeCurrentlySelectedShape(shape));
    },
    onBitBrushSliderChange: bitBrushSize => {
        dispatch(changeBitBrushSize(bitBrushSize));
    },
    onBitEraserSliderChange: eraserSize => {
        dispatch(changeBitEraserSize(eraserSize));
    },
    onEraserSliderChange: eraserSize => {
        dispatch(changeEraserSize(eraserSize));
    },
    onEraserSimplifySliderChange: eraserSize => {
        dispatch(changeEraserSimplifySize(eraserSize));
    },
    onBrushChange: type => {
        dispatch(setBrushType(type));
    },
    onPenSimplifySliderChange: eraserSize => {
        dispatch(changePenSimplifySize(eraserSize));
    },
    onFillShapes: () => {
        dispatch(setShapesFilled(true));
    },
    onOutlineShapes: () => {
        dispatch(setShapesFilled(false));
    },
    onTextAlignLeft: () => {
        dispatch(setTextAlignment("left"));
    },
    onTextAlignRight: () => {
        dispatch(setTextAlignment("right"));
    },
    onTextAlignCenter: () => {
        dispatch(setTextAlignment("center"));
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(ModeToolsComponent));
