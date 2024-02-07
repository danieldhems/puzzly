const { Ensure, equals } = require('@serenity-js/assertions')
const { Task } = require('@serenity-js/core')
const { GetRequest, LastResponse, Send } = require('@serenity-js/rest')

/**
 * Learn more about API testing with Serenity/JS
 *  https://serenity-js.org/handbook/api-testing/
 */
module.exports.GitHubStatus = class GitHubStatus {
    static #baseApiUrl = 'https://www.githubstatus.com/api/v2/'
    static #statusJson = this.#baseApiUrl + 'status.json'

    static ensureAllSystemsOperational = () =>
        Task.where(`#actor ensures all GitHub systems are operational`,
            Send.a(GetRequest.to(this.#statusJson)),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(
                LastResponse.body().status.description.describedAs('GitHub Status'),
                equals('All Systems Operational')
            ),
        )
}
