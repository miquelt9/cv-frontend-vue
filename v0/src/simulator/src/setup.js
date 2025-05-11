/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

import { Tooltip } from 'bootstrap'
import metadata from './metadata.json'
import { generateId, showMessage } from './utils'
import backgroundArea from './backgroundArea'
import plotArea from './plotArea'
import simulationArea from './simulationArea'
import { dots } from './canvasApi'
import { update, updateSimulationSet, updateCanvasSet } from './engine'
import { setupUI } from './ux'
import startMainListeners from './listeners'
// import startEmbedListeners from './embedListeners'
import './embed'
import { newCircuit, scopeList } from './circuit'
import load from './data/load'
import save from './data/save'
import { showTourGuide } from './tutorials'
import setupModules from './moduleSetup'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/addon/hint/show-hint'
import { setupCodeMirrorEnvironment } from './Verilog2CV'
import '../vendor/jquery-ui.min.css'
import '../vendor/jquery-ui.min'
import { confirmSingleOption } from '#/components/helpers/confirmComponent/ConfirmComponent.vue'
import { getToken } from '#/pages/simulatorHandler.vue'
// import { usePromptStore } from '#/store/promptStore'; // Removed import, handled in simulator.vue

/**
 * to resize window and setup things it
 * sets up new width for the canvas variables.
 * Also redraws the grid.
 * @category setup
 */
export function resetup() {
    DPR = window.devicePixelRatio || 1
    if (lightMode) {
        DPR = 1
    }
    width = document.getElementById('simulationArea').clientWidth * DPR
    if (!embed) {
        height =
            (document.body.clientHeight -
                document.getElementById('toolbar').clientHeight) *
            DPR
    } else {
        height = document.getElementById('simulation').clientHeight * DPR
    }
    backgroundArea.setup()
    simulationArea.setup()
    dots()
    document.getElementById('backgroundArea').style.height =
        height / DPR + 100 + 'px'
    document.getElementById('backgroundArea').style.width =
        width / DPR + 100 + 'px'
    document.getElementById('canvasArea').style.height = height / DPR + 'px'
    simulationArea.canvas.width = width
    simulationArea.canvas.height = height
    backgroundArea.canvas.width = width + 100 * DPR
    backgroundArea.canvas.height = height + 100 * DPR
    if (!embed) {
        plotArea.setup()
    }
    updateCanvasSet(true)
    update()
    simulationArea.prevScale = 0
    dots()
}

window.onresize = resetup
window.onorientationchange = resetup
window.addEventListener('orientationchange', resetup)

function setupEnvironment() {
    setupModules()
    const projectId = generateId()
    window.projectId = projectId
    updateSimulationSet(true)
    newCircuit('Main')
    window.data = {}
    resetup()
    setupCodeMirrorEnvironment()
}

function setupElementLists() {
    window.circuitElementList = metadata.circuitElementList
    window.annotationList = metadata.annotationList
    window.inputList = metadata.inputList
    window.subCircuitInputList = metadata.subCircuitInputList
    window.moduleList = [...circuitElementList, ...annotationList]
    window.updateOrder = [
        'wires',
        ...circuitElementList,
        'nodes',
        ...annotationList,
    ]
    window.renderOrder = [...moduleList.slice().reverse(), 'wires', 'allNodes']
}

async function fetchProjectData(projectId) {
    try {
        const response = await fetch(
            `/api/v1/projects/${projectId}/circuit_data`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Token ${getToken('cvt')}`,
                },
            }
        )
        if (response.ok) {
            const data = await response.json()
            const simulatorVersion = data.simulatorVersion
            const projectName = data.name
            if(!simulatorVersion){
                window.location.href = `/simulator/edit/${projectName}`
            }
            if(simulatorVersion && simulatorVersion != "v0"){
                window.location.href = `/simulatorvue/edit/${projectName}?simver=${simulatorVersion}`
            }
            await load(data)
            await simulationArea.changeClockTime(data.timePeriod || 500)
            $('.loadingIcon').fadeOut()
        } else {
            throw new Error('API call failed')
        }
    } catch (error) {
        console.error(error)
        confirmSingleOption('Error: Could not load.')
        $('.loadingIcon').fadeOut()
    }
}

async function loadProjectData() {
    window.logixProjectId = window.logixProjectId ?? 0
    if (window.logixProjectId !== 0) {
        $('.loadingIcon').fadeIn()
        await fetchProjectData(window.logixProjectId)
    } else if (localStorage.getItem('recover_login') && window.isUserLoggedIn) {
        const data = JSON.parse(localStorage.getItem('recover_login'))
        await load(data)
        localStorage.removeItem('recover')
        localStorage.removeItem('recover_login')
        await save()
    } else if (localStorage.getItem('recover')) {
        showMessage(
            "We have detected that you did not save your last work. Don't worry we have recovered them. Access them using Project->Recover"
        )
    }
}

function showTour() {
    if (!localStorage.tutorials_tour_done && !embed) {
        setTimeout(() => {
            showTourGuide()
        }, 2000)
    }
}

// Removed initializeAuthentication() function from here

export function setup() {
    // Jutge authentication initialization is now handled in simulator.vue's onMounted
    setupElementLists()
    setupEnvironment()
    if (!embed) {
        setupUI()
        startMainListeners()
    }
    loadProjectData()
    showTour()
}
