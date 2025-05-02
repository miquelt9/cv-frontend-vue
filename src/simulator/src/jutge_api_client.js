/**

This file has been automatically generated at 2025-05-01T17:49:55.642Z

Name:    Jutge API
Version: 2.0.0

Description:

Jutge API

*/

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-inner-declarations */

var jutge_api_client = {
    //

    // default value for the Jutge API URL
    JUTGE_API_URL: "https://api.jutge.org/api",

    // global variable to store the meta information
    meta: undefined,

    // exceptions

    UnauthorizedError: class extends Error {
        name = "UnauthorizedError"
        constructor(message = "Unauthorized") {
            super(message)
        }
    },

    InfoError: class extends Error {
        name = "InfoError"
        constructor(message) {
            super(message)
        }
    },

    NotFoundError: class extends Error {
        name = "NotFoundError"
        constructor(message) {
            super(message)
        }
    },

    InputError: class extends Error {
        name = "InputError"
        constructor(message) {
            super(message)
        }
    },

    ProtocolError: class extends Error {
        name = "ProtocolError"
        constructor(message) {
            super(message)
        }
    },

    /** Function that sends a request to the API and returns the response **/

    execute: async function (func, input, ifiles = []) {
        // prepare form
        const iform = new FormData()
        const idata = { func, input, meta: jutge_api_client.meta }
        iform.append("data", JSON.stringify(idata))
        for (const index in ifiles) iform.append(`file_${index}`, ifiles[index])

        // send request
        const response = await fetch(jutge_api_client.JUTGE_API_URL, {
            method: "POST",
            body: iform,
        })

        // process response
        const contentType = response.headers.get("content-type")?.split(";")[0].toLowerCase()
        if (contentType !== "multipart/form-data") {
            throw new jutge_api_client.ProtocolError("The content type is not multipart/form-data")
        }

        const oform = await response.formData()
        const odata = oform.get("data")
        const { output, error, duration, operation_id, time } = JSON.parse(odata)

        if (error) {
            jutge_api_client.throwError(error, operation_id)
        }

        // extract ofiles
        const ofiles = []
        for (const [key, value] of oform.entries()) {
            if (value instanceof File) {
                ofiles.push({
                    data: new Uint8Array(await value.arrayBuffer()),
                    name: value.name,
                    type: value.type,
                })
            }
        }

        return [output, ofiles]
    },

    throwError: function (error, operation_id) {
        const message = error.message || "Unknown error"
        if (error.name === "UnauthorizedError") {
            throw new jutge_api_client.UnauthorizedError(message)
        } else if (error.name === "InfoError") {
            throw new jutge_api_client.InfoError(message)
        } else if (error.name === "NotFoundError") {
            throw new jutge_api_client.NotFoundError(message)
        } else if (error.name === "InputError") {
            throw new jutge_api_client.InputError(message)
        } else {
            throw new Error(message)
        }
    },
}

jutge_api_client = {
    ...jutge_api_client,

    /**
    Module to provide authentication functions.
*/
    auth: {
        /**
        Login: Get an access token.        
    
        On success, token is a valid token and error is empty. On failure, token is empty and error is a message.
        **/
        login: async function (data) {
            const [output, ofiles] = await jutge_api_client.execute("auth.login", data)
            return output
        },

        /**
        Logout: Discard the access token.
    
        🔐 Authenticated        
        **/
        logout: async function () {
            const [output, ofiles] = await jutge_api_client.execute("auth.logout", null)
            return output
        },
    },

    /**
    Module with miscellaneous endpoints
*/
    misc: {
        /**
        Get version information of the API.        
        **/
        getApiVersion: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getApiVersion", null)
            return output
        },

        /**
        Get a fortune message.        
        **/
        getFortune: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getFortune", null)
            return output
        },

        /**
        Get server time.        
        **/
        getTime: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getTime", null)
            return output
        },

        /**
        Get homepage stats.        
        **/
        getHomepageStats: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getHomepageStats", null)
            return output
        },

        /**
        Get Jutge.org logo as a PNG file.        
        **/
        getLogo: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getLogo", null)
            return ofiles[0]
        },

        /**
        Returns all packs of avatars.        
    
        Avatars are used in exams and contests to identify students or participants.
        **/
        getAvatarPacks: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getAvatarPacks", null)
            return output
        },

        /**
        Returns all exam icons.        
    
        Exam icon are used in exams and contests to identify problems.
        **/
        getExamIcons: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getExamIcons", null)
            return output
        },

        /**
        Returns color mappings using colornames notation.        
    
        Color mappings may be used to colorize keys in the frontends. Color names are as defined in https://github.com/timoxley/colornames
        **/
        getColors: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getColors", null)
            return output
        },

        /**
        Returns color mappings using hexadecimal color notation.        
    
        Color mappings may be used to colorize keys in the frontends. 
        **/
        getHexColors: async function () {
            const [output, ofiles] = await jutge_api_client.execute("misc.getHexColors", null)
            return output
        },

        /**
        Returns code demos for a given compiler as a dictionary of base64 codes indexed by problem_nm.        
        **/
        getDemosForCompiler: async function (compiler_id) {
            const [output, ofiles] = await jutge_api_client.execute("misc.getDemosForCompiler", compiler_id)
            return output
        },
    },

    /**
    Module with quite static tables
*/
    tables: {
        /**
        Returns all tables.        
    
        Returns all compilers, countries, drivers, languages, proglangs, and verdicts in a single request. This data does not change often, so you should only request it once per session.
        **/
        get: async function () {
            const [output, ofiles] = await jutge_api_client.execute("tables.get", null)
            return output
        },

        /**
        Returns all languages.        
    
        Returns all languages as a dictionary of objects, indexed by id.
        **/
        getLanguages: async function () {
            const [output, ofiles] = await jutge_api_client.execute("tables.getLanguages", null)
            return output
        },

        /**
        Returns all countries.        
    
        Returns all countries as a dictionary of objects, indexed by id.
        **/
        getCountries: async function () {
            const [output, ofiles] = await jutge_api_client.execute("tables.getCountries", null)
            return output
        },

        /**
        Returns all compilers.        
    
        Returns all compilers as a dictionary of objects, indexed by id.
        **/
        getCompilers: async function () {
            const [output, ofiles] = await jutge_api_client.execute("tables.getCompilers", null)
            return output
        },

        /**
        Returns all drivers.        
    
        Returns all drivers as a dictionary of objects, indexed by id.
        **/
        getDrivers: async function () {
            const [output, ofiles] = await jutge_api_client.execute("tables.getDrivers", null)
            return output
        },

        /**
        Returns all verdicts.        
    
        Returns all verdicts as a dictionary of objects, indexed by id.
        **/
        getVerdicts: async function () {
            const [output, ofiles] = await jutge_api_client.execute("tables.getVerdicts", null)
            return output
        },

        /**
        Returns all proglangs.        
    
        Returns all proglangs (porgramming languages) as a dictionary of objects, indexed by id.
        **/
        getProglangs: async function () {
            const [output, ofiles] = await jutge_api_client.execute("tables.getProglangs", null)
            return output
        },
    },

    /**
    Module with endpoints related to problems.

There are two types of problems: *abstract problems* and *problems*. An abstract
problem is a group of problems. A problem is an instance of an abstract problem
in a particular language. Abstract problems are identified by a `problem_nm` (such
as 'P68688'), while problems are identified by a `problem_id` including its
`language_id` (such as 'P68688_en'). Abstract problems have a list of problems,
while problems have an abstract problem. Abstract problems have an author, while
problems have a translator.

Available problems depend on the actor issuing the request. For example, non
authenticated users can only access public problems, while authenticated
users can potentially access more problems.

*/
    problems: {
        /**
        Get all available abstract problems.
    
        🔐 Authenticated        
    
        Includes problems.
        **/
        getAllAbstractProblems: async function () {
            const [output, ofiles] = await jutge_api_client.execute("problems.getAllAbstractProblems", null)
            return output
        },

        /**
        Get available abstract problems whose keys are in `problem_nms`.
    
        🔐 Authenticated        
    
        Includes problems.
        **/
        getAbstractProblems: async function (problem_nms) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getAbstractProblems", problem_nms)
            return output
        },

        /**
        Get available abstract problems that belong to a list.
    
        🔐 Authenticated        
    
        Includes problems.
        **/
        getAbstractProblemsInList: async function (list_key) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getAbstractProblemsInList", list_key)
            return output
        },

        /**
        Get an abstract problem.
    
        🔐 Authenticated        
    
        Includes owner and problems
        **/
        getAbstractProblem: async function (problem_nm) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getAbstractProblem", problem_nm)
            return output
        },

        /**
        Get supplementary information of an abstract problem.
    
        🔐 Authenticated        
    
        Includes accepted compilers and accepted proglangs
        **/
        getAbstractProblemSuppl: async function (problem_nm) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getAbstractProblemSuppl", problem_nm)
            return output
        },

        /**
        Get a problem.
    
        🔐 Authenticated        
    
        Includes abstract problem, which includes owner
        **/
        getProblem: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getProblem", problem_id)
            return output
        },

        /**
        Get a problem with more infos.
    
        🔐 Authenticated        
    
        Includes abstract problem, which includes owner, statements, testcases, etc.
        **/
        getProblemRich: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getProblemRich", problem_id)
            return output
        },

        /**
        Get supplementary information of a problem.
    
        🔐 Authenticated        
    
        Includes accepted compilers, accepted proglangs, official solutions
    checks and handler specifications
        **/
        getProblemSuppl: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getProblemSuppl", problem_id)
            return output
        },

        /**
        Get sample testcases of a problem.
    
        🔐 Authenticated        
        **/
        getSampleTestcases: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getSampleTestcases", problem_id)
            return output
        },

        /**
        Get public testcases of a problem.
    
        🔐 Authenticated        
    
        Public testcases are like sample testcases, but are not meant to be show
    in the problem statatement, because of their long length.
        **/
        getPublicTestcases: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getPublicTestcases", problem_id)
            return output
        },

        /**
        Get Html statement of a problem.
    
        🔐 Authenticated        
    
        Currently, this is suboptimal, but I already know how to improve it.
        **/
        getHtmlStatement: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getHtmlStatement", problem_id)
            return output
        },

        /**
        Get Text statement of a problem.
    
        🔐 Authenticated        
        **/
        getTextStatement: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getTextStatement", problem_id)
            return output
        },

        /**
        Get Markdown statement of a problem.
    
        🔐 Authenticated        
        **/
        getMarkdownStatement: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getMarkdownStatement", problem_id)
            return output
        },

        /**
        Get PDF statement of a problem.
    
        🔐 Authenticated        
        **/
        getPdfStatement: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getPdfStatement", problem_id)
            return ofiles[0]
        },

        /**
        Get ZIP archive of a problem.
    
    This includes the PDF statement and sample testcases.
    
        🔐 Authenticated        
        **/
        getZipStatement: async function (problem_id) {
            const [output, ofiles] = await jutge_api_client.execute("problems.getZipStatement", problem_id)
            return ofiles[0]
        },
    },

    /**
    These operations are available to all users, provided they are authenticated.
*/
    student: {
        /**
        This module exposes all valid keys for problems, courses and lists that a user can access.
    */
        keys: {
            /**
            Get problem, courses (as enrolled and available) and list keys.
        
            🔐 Authenticated        
            **/
            get: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.keys.get", null)
                return output
            },

            /**
            Get problem keys.
        
            🔐 Authenticated        
            **/
            getProblems: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.keys.getProblems", null)
                return output
            },

            /**
            Get enrolled course keys.
        
            🔐 Authenticated        
            **/
            getEnrolledCourses: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.keys.getEnrolledCourses", null)
                return output
            },

            /**
            Get available course keys.
        
            🔐 Authenticated        
            **/
            getAvailableCourses: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.keys.getAvailableCourses", null)
                return output
            },

            /**
            Get list keys.
        
            🔐 Authenticated        
            **/
            getLists: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.keys.getLists", null)
                return output
            },
        },

        /**
        This module exposes the user profile.
    */
        profile: {
            /**
            Get the profile.
        
            🔐 Authenticated        
            **/
            get: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.profile.get", null)
                return output
            },

            /**
            Returns the avatar as a PNG file.
        
            🔐 Authenticated        
            **/
            getAvatar: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.profile.getAvatar", null)
                return ofiles[0]
            },

            /**
            Update the profile
        
            🔐 Authenticated        
            **/
            update: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.profile.update", data)
                return output
            },

            /**
            Update the avatar with new PNG.
        
            🔐 Authenticated        
            **/
            updateAvatar: async function (ifile) {
                const [output, ofiles] = await jutge_api_client.execute("student.profile.updateAvatar", null, [ifile])
                return output
            },

            /**
            Update password.
        
            🔐 Authenticated        
        
            Receives the old password and the new one, and changes the password if the old one is correct and the new one strong enough.
            **/
            updatePassword: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.profile.updatePassword", data)
                return output
            },
        },

        dashboard: {
            /**
            Get the ranking of the user over all users in the system.
        
            🔐 Authenticated        
            **/
            getAbsoluteRanking: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.dashboard.getAbsoluteRanking", null)
                return output
            },

            /**
            Get all distributions.
        
            🔐 Authenticated        
            **/
            getAllDistributions: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.dashboard.getAllDistributions", null)
                return output
            },

            /**
            Get compilers distribution.
        
            🔐 Authenticated        
            **/
            getCompilersDistribution: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "student.dashboard.getCompilersDistribution",
                    null,
                )
                return output
            },

            /**
            Get dashboard.
        
            🔐 Authenticated        
            **/
            getDashboard: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.dashboard.getDashboard", null)
                return output
            },

            /**
            Get heatmap calendar of submissions.
        
            🔐 Authenticated        
            **/
            getHeatmapCalendar: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.dashboard.getHeatmapCalendar", null)
                return output
            },

            /**
            Get programming languages distribution.
        
            🔐 Authenticated        
            **/
            getProglangsDistribution: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "student.dashboard.getProglangsDistribution",
                    null,
                )
                return output
            },

            /**
            Get dashboard stats.
        
            🔐 Authenticated        
            **/
            getStats: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.dashboard.getStats", null)
                return output
            },

            /**
            Get fancy Jutge level.
        
            🔐 Authenticated        
            **/
            getLevel: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.dashboard.getLevel", null)
                return output
            },

            /**
            Get submissions by hour distribution.
        
            🔐 Authenticated        
            **/
            getSubmissionsByHour: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.dashboard.getSubmissionsByHour", null)
                return output
            },

            /**
            Get submissions by weekday distribution.
        
            🔐 Authenticated        
            **/
            getSubmissionsByWeekDay: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "student.dashboard.getSubmissionsByWeekDay",
                    null,
                )
                return output
            },

            /**
            Get verdicts distribution.
        
            🔐 Authenticated        
            **/
            getVerdictsDistribution: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "student.dashboard.getVerdictsDistribution",
                    null,
                )
                return output
            },
        },

        submissions: {
            /**
            Get index of all submissions for an abstract problem.
        
            🔐 Authenticated        
        
            Grouped by problem.
            **/
            indexForAbstractProblem: async function (problem_nm) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "student.submissions.indexForAbstractProblem",
                    problem_nm,
                )
                return output
            },

            /**
            Get index of all submissions for a problem.
        
            🔐 Authenticated        
            **/
            indexForProblem: async function (problem_id) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "student.submissions.indexForProblem",
                    problem_id,
                )
                return output
            },

            /**
            Get all submissions.
        
            🔐 Authenticated        
        
            Flat array of submissions in chronological order.
            **/
            getAll: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.getAll", null)
                return output
            },

            /**
            Submit a solution to the Judge, easy interface.
        
            🔐 Authenticated        
            **/
            submit: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.submit", data)
                return output
            },

            /**
            Submit a solution to the Judge, full interface.
        
            🔐 Authenticated        
            **/
            submitFull: async function (data, ifile) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.submitFull", data, [ifile])
                return output
            },

            /**
            Get a submission.
        
            🔐 Authenticated        
            **/
            get: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.get", data)
                return output
            },

            /**
            Get code for a submission as a string in base64.
        
            🔐 Authenticated        
            **/
            getCodeAsB64: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.getCodeAsB64", data)
                return output
            },

            /**
            Get code metrics for a submission as JSON.
        
            🔐 Authenticated    
            ❌ Warning: TODO: add more documentation    
        
            See https://github.com/jutge-org/jutge-code-metrics for details.
            **/
            getCodeMetrics: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.getCodeMetrics", data)
                return output
            },

            /**
            Get list of awards ids for a submission.
        
            🔐 Authenticated        
            **/
            getAwards: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.getAwards", data)
                return output
            },

            /**
            Get analysis of a submission.
        
            🔐 Authenticated        
            **/
            getAnalysis: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.getAnalysis", data)
                return output
            },

            /**
            Get a (public) testcase analysis of a submission.
        
            🔐 Authenticated        
            **/
            getTestcaseAnalysis: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("student.submissions.getTestcaseAnalysis", data)
                return output
            },
        },

        courses: {
            /**
            Get index of all available courses.
        
            🔐 Authenticated        
            **/
            indexAvailable: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.courses.indexAvailable", null)
                return output
            },

            /**
            Get index of all enrolled courses.
        
            🔐 Authenticated        
            **/
            indexEnrolled: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.courses.indexEnrolled", null)
                return output
            },

            /**
            Get an available course.
        
            🔐 Authenticated        
        
            Includes owner and lists.
            **/
            getAvailable: async function (course_key) {
                const [output, ofiles] = await jutge_api_client.execute("student.courses.getAvailable", course_key)
                return output
            },

            /**
            Get an enrolled course.
        
            🔐 Authenticated        
        
            Includes owner and lists.
            **/
            getEnrolled: async function (course_key) {
                const [output, ofiles] = await jutge_api_client.execute("student.courses.getEnrolled", course_key)
                return output
            },

            /**
            Enroll in an available course.
        
            🔐 Authenticated        
            **/
            enroll: async function (course_key) {
                const [output, ofiles] = await jutge_api_client.execute("student.courses.enroll", course_key)
                return output
            },

            /**
            Unenroll from an enrolled course.
        
            🔐 Authenticated        
            **/
            unenroll: async function (course_key) {
                const [output, ofiles] = await jutge_api_client.execute("student.courses.unenroll", course_key)
                return output
            },
        },

        lists: {
            /**
            Get all lists.
        
            🔐 Authenticated        
            **/
            getAll: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.lists.getAll", null)
                return output
            },

            /**
            Get a list.
        
            🔐 Authenticated        
        
            Includes items, owner.
            **/
            get: async function (list_key) {
                const [output, ofiles] = await jutge_api_client.execute("student.lists.get", list_key)
                return output
            },
        },

        statuses: {
            /**
            Get statuses for all problems.
        
            🔐 Authenticated        
            **/
            getAll: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.statuses.getAll", null)
                return output
            },

            /**
            Get status for an abstract problem.
        
            🔐 Authenticated        
            **/
            getForAbstractProblem: async function (problem_nm) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "student.statuses.getForAbstractProblem",
                    problem_nm,
                )
                return output
            },

            /**
            Get status for a problem.
        
            🔐 Authenticated        
            **/
            getForProblem: async function (problem_id) {
                const [output, ofiles] = await jutge_api_client.execute("student.statuses.getForProblem", problem_id)
                return output
            },
        },

        /**
        This module is not yet finished.
    */
        awards: {
            /**
            Get all awards.
        
            🔐 Authenticated        
            **/
            getAll: async function () {
                const [output, ofiles] = await jutge_api_client.execute("student.awards.getAll", null)
                return output
            },

            /**
            Get an award.
        
            🔐 Authenticated        
            **/
            get: async function (award_id) {
                const [output, ofiles] = await jutge_api_client.execute("student.awards.get", award_id)
                return output
            },
        },
    },

    /**
    This module is meant to be used by instructors
*/
    instructor: {
        documents: {
            /**
            Get index of all documents.
        
            🔐 Authenticated        
            **/
            index: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.documents.index", null)
                return output
            },

            /**
            Get a document.
        
            🔐 Authenticated        
        
            The PDF file is not included in the response.
            **/
            get: async function (document_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.documents.get", document_nm)
                return output
            },

            /**
            Get PDF of a document.
        
            🔐 Authenticated        
            **/
            getPdf: async function (document_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.documents.getPdf", document_nm)
                return ofiles[0]
            },

            /**
            Create a new document.
        
            🔐 Authenticated        
            **/
            create: async function (data, ifile) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.documents.create", data, [ifile])
                return output
            },

            /**
            Update a document.
        
            🔐 Authenticated        
            **/
            update: async function (data, ifile) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.documents.update", data, [ifile])
                return output
            },

            /**
            Remove a document.
        
            🔐 Authenticated        
            **/
            remove: async function (document_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.documents.remove", document_nm)
                return output
            },
        },

        lists: {
            /**
            Get index of all lists.
        
            🔐 Authenticated        
            **/
            index: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.index", null)
                return output
            },

            /**
            Get a list.
        
            🔐 Authenticated        
            **/
            get: async function (list_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.get", list_nm)
                return output
            },

            /**
            Create a new list.
        
            🔐 Authenticated        
            **/
            create: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.create", data)
                return output
            },

            /**
            Update an existing list.
        
            🔐 Authenticated        
            **/
            update: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.update", data)
                return output
            },

            /**
            Delete an existing list.
        
            🔐 Authenticated        
            **/
            remove: async function (list_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.remove", list_nm)
                return output
            },

            /**
            Get the list of lists that are archived.
        
            🔐 Authenticated        
        
            At some point, endpoints related to archiving lists should change as the archive bit will be an attribute of each list.
            **/
            getArchived: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.getArchived", null)
                return output
            },

            /**
            Archive a list.
        
            🔐 Authenticated        
            **/
            archive: async function (list_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.archive", list_nm)
                return output
            },

            /**
            Unarchive a list.
        
            🔐 Authenticated        
            **/
            unarchive: async function (list_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.lists.unarchive", list_nm)
                return output
            },
        },

        /**
        
    This module manages the courses that an instructor is teaching. It allows the instructor to manage the course, including getting and updating its lists, students and tutors. It can also send invites to pending students and tutors.
    
    The course name is a unique slug for the course. It is used to reference the course in the system.
    
    The course title is the human-readable title of the course.
    
    The course description is a human-readable description of the course.
    
    Students and tutors are managed in three lists: invited, enrolled and pending. These contains the emails of these users. Invited students and tutors are those who have been invited to the course. Enrolled students and tutors are those who have accepted the invitation and are part of the course. Pending students and tutors are those who have been invited to join the course but have not yet accepted. Enrolled and pending students and tutors are managed by the system and cannot not be modified directly.
    
    */
        courses: {
            /**
            Get index of all courses.
        
            🔐 Authenticated        
            **/
            index: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.index", null)
                return output
            },

            /**
            Get a course.
        
            🔐 Authenticated        
            **/
            get: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.get", course_nm)
                return output
            },

            /**
            Create a new course.
        
            🔐 Authenticated        
        
            Only invited students and tutors are taken into account. Enrolled and pending students and tutors are ignored, as these are managed by the system.
            **/
            create: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.create", data)
                return output
            },

            /**
            Update an existing course.
        
            🔐 Authenticated        
        
            Only invited students and tutors are taken into account. Enrolled and pending students and tutors are ignored, as these are managed by the system.
            **/
            update: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.update", data)
                return output
            },

            /**
            Delete an existing course.
        
            🔐 Authenticated        
        
            A course should not be deleted. Ask a system administrator to remove it if you really need it.
            **/
            remove: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.remove", course_nm)
                return output
            },

            /**
            Send invite email to pending students in the course.
        
            🔐 Authenticated        
        
            Please do not abuse.
            **/
            sendInviteToStudents: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.courses.sendInviteToStudents",
                    course_nm,
                )
                return output
            },

            /**
            Send invite email to pending tutors in the course.
        
            🔐 Authenticated        
        
            Please do not abuse.
            **/
            sendInviteToTutors: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.courses.sendInviteToTutors",
                    course_nm,
                )
                return output
            },

            /**
            Get the profiles of the students enrolled in the course.
        
            🔐 Authenticated        
            **/
            getStudentProfiles: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.courses.getStudentProfiles",
                    course_nm,
                )
                return output
            },

            /**
            Get the profiles of the tutors enrolled in the course.
        
            🔐 Authenticated        
            **/
            getTutorProfiles: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.courses.getTutorProfiles",
                    course_nm,
                )
                return output
            },

            /**
            Get the list of courses that are archived.
        
            🔐 Authenticated        
        
            At some point, endpoints related to archiving courses should change as the archive bit will be an attribute of each course.
            **/
            getArchived: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.getArchived", null)
                return output
            },

            /**
            Archive a course.
        
            🔐 Authenticated        
            **/
            archive: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.archive", course_nm)
                return output
            },

            /**
            Unarchive a course.
        
            🔐 Authenticated        
            **/
            unarchive: async function (course_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.courses.unarchive", course_nm)
                return output
            },
        },

        /**
        
    
    This module manages the exams that an instructor is teaching. It allows the instructor to manage the exam, including getting and updating its documents, problems, students and submissions.
    
    Exams objects are quite complex. Thus, this interface is also a bit complex. Each part of an exam can be get or updated in a separate endpoint. The main endpoint is the get endpoint, which returns the full exam object.
    
    
    */
        exams: {
            /**
            Get index of all exams.
        
            🔐 Authenticated        
            **/
            index: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.index", null)
                return output
            },

            /**
            Get an exam.
        
            🔐 Authenticated        
            **/
            get: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.get", exam_nm)
                return output
            },

            /**
            Get documents of an exam.
        
            🔐 Authenticated        
            **/
            getDocuments: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getDocuments", exam_nm)
                return output
            },

            /**
            Get problems of an exam.
        
            🔐 Authenticated        
            **/
            getProblems: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getProblems", exam_nm)
                return output
            },

            /**
            Get students of an exam.
        
            🔐 Authenticated        
            **/
            getStudents: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getStudents", exam_nm)
                return output
            },

            /**
            Get an student of an exam.
        
            🔐 Authenticated        
            **/
            getStudent: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getStudent", data)
                return output
            },

            /**
            Get submissions of an exam.
        
            🔐 Authenticated        
            **/
            getSubmissions: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getSubmissions", data)
                return output
            },

            /**
            Get statistics of an exam.
        
            🔐 Authenticated        
            **/
            getStatistics: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getStatistics", exam_nm)
                return output
            },

            /**
            Create a new exam.
        
            🔐 Authenticated        
            **/
            create: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.create", data)
                return output
            },

            /**
            Update an existing exam.
        
            🔐 Authenticated        
            **/
            update: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.update", data)
                return output
            },

            /**
            Update documents of an exam.
        
            🔐 Authenticated        
            **/
            updateDocuments: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.updateDocuments", data)
                return output
            },

            /**
            Update compilers of an exam.
        
            🔐 Authenticated        
            **/
            updateCompilers: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.updateCompilers", data)
                return output
            },

            /**
            Update problems of an exam.
        
            🔐 Authenticated        
            **/
            updateProblems: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.updateProblems", data)
                return output
            },

            /**
            Update students of an exam.
        
            🔐 Authenticated        
            **/
            updateStudents: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.updateStudents", data)
                return output
            },

            /**
            Add students to an exam.
        
            🔐 Authenticated        
            **/
            addStudents: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.addStudents", data)
                return output
            },

            /**
            Remove students from an exam.
        
            🔐 Authenticated        
            **/
            removeStudents: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.removeStudents", data)
                return output
            },

            /**
            Delete an existing exam.
        
            🔐 Authenticated        
        
            Note: An exam can only be deleted if it has not started.
            **/
            remove: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.remove", exam_nm)
                return output
            },

            /**
            Get the list of exams that are archived.
        
            🔐 Authenticated        
        
            At some point, endpoints related to archiving exams should change as the archive bit will be an attribute of each exam.
            **/
            getArchived: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getArchived", null)
                return output
            },

            /**
            Archive an exam.
        
            🔐 Authenticated        
            **/
            archive: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.archive", exam_nm)
                return output
            },

            /**
            Unarchive an exam.
        
            🔐 Authenticated        
            **/
            unarchive: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.unarchive", exam_nm)
                return output
            },

            /**
            Get the ranking.
        
            🔐 Authenticated        
        
            Under development.
            **/
            getRanking: async function (exam_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.exams.getRanking", exam_nm)
                return output
            },
        },

        problems: {
            /**
            Get the list of own problems.
        
            🔐 Authenticated        
            **/
            getOwnProblems: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.getOwnProblems", null)
                return output
            },

            /**
            Get the passcode of a problem.
        
            🔐 Authenticated        
        
            Returns an empty string if the problem has no passcode.
            **/
            getPasscode: async function (problem_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.getPasscode", problem_nm)
                return output
            },

            /**
            Set or update the passcode of a problem.
        
            🔐 Authenticated        
        
            The passcode must be at least 8 characters long and contain only alphanumeric characters. The passcode will be stored in the database in plain text.
            **/
            setPasscode: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.setPasscode", data)
                return output
            },

            /**
            Remove passcode of a problem.
        
            🔐 Authenticated        
            **/
            removePasscode: async function (problem_nm) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.problems.removePasscode",
                    problem_nm,
                )
                return output
            },

            /**
            Share passcode to a list of users identified by their email.
        
            🔐 Authenticated        
        
            No emails are sent. Emails that are not registered in the system are ignored.
            **/
            sharePasscode: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.sharePasscode", data)
                return output
            },

            /**
            Deprecate a problem.
        
            🔐 Authenticated        
            **/
            deprecate: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.deprecate", data)
                return output
            },

            /**
            Undeprecate a problem.
        
            🔐 Authenticated        
            **/
            undeprecate: async function (problem_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.undeprecate", problem_nm)
                return output
            },

            /**
            Download a problem as a ZIP file.
        
            🔐 Authenticated        
        
            Quick and dirty implementation, should be improved. Returns a ZIP file with the abstract problem and all its problems.
            **/
            download: async function (problem_nm) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.download", problem_nm)
                return ofiles[0]
            },

            /**
            Create a problem from a ZIP archive using old PHP code.
        
            🔐 Authenticated        
        
            At some point, this endpoint will be deprecated. It is a bit slow (about one minute). Returns the problem_nm of the new problem. Does not provide any feedback.
            **/
            legacyCreate: async function (passcode, ifile) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.problems.legacyCreate", passcode, [
                    ifile,
                ])
                return output
            },

            /**
            Update a problem from a ZIP archive using old PHP code.
        
            🔐 Authenticated        
        
            At some point, this endpoint will be deprecated. Does not provide any feedback.
            **/
            legacyUpdate: async function (problem_nm, ifile) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.problems.legacyUpdate",
                    problem_nm,
                    [ifile],
                )
                return output
            },

            /**
            Create a problem from a ZIP archive using old PHP code using terminal streaming.
        
            🔐 Authenticated        
        
            At some point, this endpoint will be deprecated. Returns a Terminal from which the problem feedback is streamed.
            **/
            legacyCreateWithTerminal: async function (passcode, ifile) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.problems.legacyCreateWithTerminal",
                    passcode,
                    [ifile],
                )
                return output
            },

            /**
            Update a problem from a ZIP archive using old PHP code using terminal streaming.
        
            🔐 Authenticated        
        
            At some point, this endpoint will be deprecated. Returns an id from which the problem feedback is streamed under /terminals.
            **/
            legacyUpdateWithTerminal: async function (problem_nm, ifile) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.problems.legacyUpdateWithTerminal",
                    problem_nm,
                    [ifile],
                )
                return output
            },
        },

        queries: {
            /**
            Get submissions for a problem in a course.
        
            🔐 Authenticated        
        
            Returns a list of submissions for a given problem for all students of a given course. Each submission includes the email, time, problem name, problem id, verdict, and IP address. The list is ordered by email and time. Known as ricard01 in the past.
            **/
            getCourseProblemSubmissions: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.queries.getCourseProblemSubmissions",
                    data,
                )
                return output
            },

            /**
            Get submissions for all problems in a list in a course.
        
            🔐 Authenticated        
        
            Returns a list of submissions for all problems in a given list for all students of a given course. Each submission includes the email, time, problem name, problem id, verdict, and IP address. The list is ordered by email, problem id and time. Known as ricard02 in the past.
            **/
            getCourseListSubmissions: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "instructor.queries.getCourseListSubmissions",
                    data,
                )
                return output
            },
        },

        tags: {
            /**
            Get list of all tags.
        
            🔐 Authenticated        
            **/
            index: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.tags.index", null)
                return output
            },

            /**
            Get all tags with their problems.
        
            🔐 Authenticated        
            **/
            getDict: async function () {
                const [output, ofiles] = await jutge_api_client.execute("instructor.tags.getDict", null)
                return output
            },

            /**
            Get all problems with a given tag.
        
            🔐 Authenticated        
            **/
            get: async function (tag) {
                const [output, ofiles] = await jutge_api_client.execute("instructor.tags.get", tag)
                return output
            },
        },
    },

    /**
    Module with administration endpoints. Not meant for regular users. It still lacks lots of endpoints
*/
    admin: {
        instructors: {
            /**
            Get instructors.
        
            🔐 Authenticated        
            **/
            get: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.instructors.get", null)
                return output
            },

            /**
            Add an instructor.
        
            🔐 Authenticated        
            **/
            add: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.instructors.add", data)
                return output
            },

            /**
            Remove an instructor.
        
            🔐 Authenticated        
            **/
            remove: async function (email) {
                const [output, ofiles] = await jutge_api_client.execute("admin.instructors.remove", email)
                return output
            },
        },

        users: {
            /**
            Count users
        
            🔐 Authenticated        
            **/
            count: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.users.count", null)
                return output
            },

            /**
            Create a user
        
            🔐 Authenticated        
            **/
            create: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.users.create", data)
                return output
            },

            /**
            Remove a user
        
            🔐 Authenticated        
            **/
            remove: async function (email) {
                const [output, ofiles] = await jutge_api_client.execute("admin.users.remove", email)
                return output
            },

            /**
            Set a password for a user
        
            🔐 Authenticated        
            **/
            setPassword: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.users.setPassword", data)
                return output
            },

            /**
            Get all users (well, just email and name) whose email contains a specific string
        
            🔐 Authenticated        
            **/
            getAllWithEmail: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.users.getAllWithEmail", data)
                return output
            },

            /**
            Get a list of emails of spam users
        
            🔐 Authenticated        
            **/
            getSpamUsers: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.users.getSpamUsers", null)
                return output
            },

            /**
            Remove spam users
        
            🔐 Authenticated        
            **/
            removeSpamUsers: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.users.removeSpamUsers", data)
                return output
            },
        },

        dashboard: {
            /**
            Get all admin dashboard items.
        
            🔐 Authenticated        
            **/
            getAll: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.dashboard.getAll", null)
                return output
            },

            /**
            Get free disk space.
        
            🔐 Authenticated        
            **/
            getFreeDiskSpace: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.dashboard.getFreeDiskSpace", null)
                return output
            },

            /**
            Get recent connected users.
        
            🔐 Authenticated        
            **/
            getRecentConnectedUsers: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.dashboard.getRecentConnectedUsers", null)
                return output
            },

            /**
            Get recent load averages.
        
            🔐 Authenticated        
            **/
            getRecentLoadAverages: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.dashboard.getRecentLoadAverages", null)
                return output
            },

            /**
            Get recent submissions.
        
            🔐 Authenticated        
            **/
            getRecentSubmissions: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.dashboard.getRecentSubmissions", null)
                return output
            },

            /**
            Get submissions histograms.
        
            🔐 Authenticated        
            **/
            getSubmissionsHistograms: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.dashboard.getSubmissionsHistograms",
                    null,
                )
                return output
            },

            /**
            Get zombies.
        
            🔐 Authenticated        
            **/
            getZombies: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.dashboard.getZombies", null)
                return output
            },

            /**
            Get upcoming exams
        
            🔐 Authenticated        
            **/
            getUpcomingExams: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.dashboard.getUpcomingExams", data)
                return output
            },
        },

        queue: {
            /**
            Get the last 100 submissions from the queue in descending chronological order.
        
            🔐 Authenticated        
            **/
            getQueue: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.queue.getQueue", null)
                return output
            },

            /**
            Get the last 100 zombi submissions from the queue.
        
            🔐 Authenticated        
            **/
            getQueueZombies: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.queue.getQueueZombies", null)
                return output
            },

            /**
            Get the last 100 fatal submissions from the queue.
        
            🔐 Authenticated        
            **/
            getQueueFatals: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.queue.getQueueFatals", null)
                return output
            },

            /**
            Get the last 100 setter error submissions from the queue.
        
            🔐 Authenticated        
            **/
            getQueueSetterErrors: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.queue.getQueueSetterErrors", null)
                return output
            },
        },

        tasks: {
            /**
            Purge expired access tokens.
        
            🔐 Authenticated        
        
            Purge expired access tokens (call it from time to time, it does not hurt)
            **/
            purgeAuthTokens: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.tasks.purgeAuthTokens", null)
                return output
            },

            /**
            Clear all memoization caches.
        
            🔐 Authenticated        
            **/
            clearCaches: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.tasks.clearCaches", null)
                return output
            },

            /**
            Fatalize IE submissions.
        
            🔐 Authenticated        
            **/
            fatalizeIEs: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.tasks.fatalizeIEs", null)
                return output
            },

            /**
            Fatalize pending submissions.
        
            🔐 Authenticated        
            **/
            fatalizePendings: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.tasks.fatalizePendings", null)
                return output
            },

            /**
            Resubmit IE submissions.
        
            🔐 Authenticated        
            **/
            resubmitIEs: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.tasks.resubmitIEs", null)
                return output
            },

            /**
            Resubmit pending submissions.
        
            🔐 Authenticated        
            **/
            resubmitPendings: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.tasks.resubmitPendings", null)
                return output
            },
        },

        stats: {
            /**
            Get counters.
        
            🔐 Authenticated        
            **/
            getCounters: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.stats.getCounters", null)
                return output
            },

            /**
            Get distribution of verdicts.
        
            🔐 Authenticated        
            **/
            getDistributionOfVerdicts: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.stats.getDistributionOfVerdicts", null)
                return output
            },

            /**
            Get distribution of verdicts by year.
        
            🔐 Authenticated        
            **/
            getDistributionOfVerdictsByYear: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfVerdictsByYear",
                    null,
                )
                return output
            },

            /**
            Get distribution of compilers.
        
            🔐 Authenticated        
            **/
            getDistributionOfCompilers: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.stats.getDistributionOfCompilers", null)
                return output
            },

            /**
            Get distribution of proglangs.
        
            🔐 Authenticated        
            **/
            getDistributionOfProglangs: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.stats.getDistributionOfProglangs", null)
                return output
            },

            /**
            Get distribution of registered users by year.
        
            🔐 Authenticated        
            **/
            getDistributionOfUsersByYear: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfUsersByYear",
                    null,
                )
                return output
            },

            /**
            Get distribution of registered users by country.
        
            🔐 Authenticated        
            **/
            getDistributionOfUsersByCountry: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfUsersByCountry",
                    null,
                )
                return output
            },

            /**
            Get distribution of registered users by submissions using a custom bucket size.
        
            🔐 Authenticated        
            **/
            getDistributionOfUsersBySubmissions: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfUsersBySubmissions",
                    data,
                )
                return output
            },

            /**
            Get ranking of users.
        
            🔐 Authenticated    
            ❌ Warning: Input type is not correct    
            **/
            getRankingOfUsers: async function (limit) {
                const [output, ofiles] = await jutge_api_client.execute("admin.stats.getRankingOfUsers", limit)
                return output
            },

            /**
            Get distribution of submissions by hour.
        
            🔐 Authenticated        
            **/
            getDistributionOfSubmissionsByHour: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfSubmissionsByHour",
                    null,
                )
                return output
            },

            /**
            Get distribution of submissions by proglang.
        
            🔐 Authenticated        
            **/
            getDistributionOfSubmissionsByProglang: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfSubmissionsByProglang",
                    null,
                )
                return output
            },

            /**
            Get distribution of submissions by compiler.
        
            🔐 Authenticated        
            **/
            getDistributionOfSubmissionsByCompiler: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfSubmissionsByCompiler",
                    null,
                )
                return output
            },

            /**
            Get distribution of submissions by weekday.
        
            🔐 Authenticated        
            **/
            getDistributionOfSubmissionsByWeekday: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfSubmissionsByWeekday",
                    null,
                )
                return output
            },

            /**
            Get distribution of submissions by year.
        
            🔐 Authenticated        
            **/
            getDistributionOfSubmissionsByYear: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfSubmissionsByYear",
                    null,
                )
                return output
            },

            /**
            Get distribution of submissions by year for a proglang.
        
            🔐 Authenticated        
            **/
            getDistributionOfSubmissionsByYearForProglang: async function (proglang) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfSubmissionsByYearForProglang",
                    proglang,
                )
                return output
            },

            /**
            Get distribution of submissions by day.
        
            🔐 Authenticated        
            **/
            getDistributionOfSubmissionsByDay: async function () {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getDistributionOfSubmissionsByDay",
                    null,
                )
                return output
            },

            /**
            Get heatmap calendar of submissions.
        
            🔐 Authenticated        
            **/
            getHeatmapCalendarOfSubmissions: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute(
                    "admin.stats.getHeatmapCalendarOfSubmissions",
                    data,
                )
                return output
            },

            /**
            Get distribution of domains of users' emails.
        
            🔐 Authenticated        
            **/
            getDistributionOfDomains: async function () {
                const [output, ofiles] = await jutge_api_client.execute("admin.stats.getDistributionOfDomains", null)
                return output
            },
        },

        problems: {
            /**
            Get list of proglangs for which the problem has an official solution.
        
            🔐 Authenticated        
            **/
            getSolutions: async function (problem_id) {
                const [output, ofiles] = await jutge_api_client.execute("admin.problems.getSolutions", problem_id)
                return output
            },

            /**
            Get official solution for a problem in proglang as a string in base64.
        
            🔐 Authenticated        
            **/
            getSolutionAsB64: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.problems.getSolutionAsB64", data)
                return output
            },

            /**
            Get official solution for a problem in proglang as a file.
        
            🔐 Authenticated        
            **/
            getSolutionAsFile: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("admin.problems.getSolutionAsFile", data)
                return ofiles[0]
            },
        },
    },

    /**
    Module with testing endpoints. Not meant for regular users.
*/
    testing: {
        /**
        This module is intended for internal use and contains functions to check the actor of the query. General public should not rely on it.
    */
        check: {
            /**
            Checks that query actor is a user.
        
            🔐 Authenticated        
            **/
            checkUser: async function () {
                const [output, ofiles] = await jutge_api_client.execute("testing.check.checkUser", null)
                return output
            },

            /**
            Checks that query actor is an instructor.
        
            🔐 Authenticated        
            **/
            checkInstructor: async function () {
                const [output, ofiles] = await jutge_api_client.execute("testing.check.checkInstructor", null)
                return output
            },

            /**
            Checks that query actor is an admin.
        
            🔐 Authenticated        
            **/
            checkAdmin: async function () {
                const [output, ofiles] = await jutge_api_client.execute("testing.check.checkAdmin", null)
                return output
            },

            /**
            Throw an exception of the given type.        
            **/
            throwError: async function (exception) {
                const [output, ofiles] = await jutge_api_client.execute("testing.check.throwError", exception)
                return output
            },
        },

        /**
        This module is intended for internal use. General users should not rely on it.
    */
        playground: {
            /**
            Upload a file.        
            **/
            upload: async function (data, ifile) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.upload", data, [ifile])
                return output
            },

            /**
            Get negative of an image.        
            **/
            negate: async function (ifile) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.negate", null, [ifile])
                return ofiles[0]
            },

            /**
            Download a file.        
            **/
            download: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.download", data)
                return ofiles[0]
            },

            /**
            Download a file with a string.        
            **/
            download2: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.download2", data)
                return [output, ofiles[0]]
            },

            /**
            Ping the server to get a pong string.        
            **/
            ping: async function () {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.ping", null)
                return output
            },

            /**
            Returns the given string in uppercase.        
            **/
            toUpperCase: async function (s) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.toUpperCase", s)
                return output
            },

            /**
            Returns the sum of two integers.        
            **/
            add2i: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.add2i", data)
                return output
            },

            /**
            Returns the sum of two floats.        
            **/
            add2f: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.add2f", data)
                return output
            },

            /**
            increment two numbers.        
            **/
            inc: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.inc", data)
                return output
            },

            /**
            Returns the sum of three integers.        
            **/
            add3i: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.add3i", data)
                return output
            },

            /**
            Returns a type with defaults.        
            **/
            something: async function (data) {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.something", data)
                return output
            },

            /**
            Get a webstream with clok data.        
            **/
            clock: async function () {
                const [output, ofiles] = await jutge_api_client.execute("testing.playground.clock", null)
                return output
            },
        },
    },
}

// my hack to allow using in the browser and the console
try {
    module.exports = { jutge_api_client }
} catch (error) {}

export { jutge_api_client }
