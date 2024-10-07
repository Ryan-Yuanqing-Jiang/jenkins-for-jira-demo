import React, { useEffect, useState } from 'react'
import Button, { LoadingButton } from '@atlaskit/button'
import Form, { FormFooter } from '@atlaskit/form'
import { v4 as uuidv4 } from 'uuid'
import { useHistory } from 'react-router'
import { loadingIcon } from '../../JenkinsConfigurationForm/JenkinsConfigurationForm.styles'
import { createJenkinsServer } from '../../../api/createJenkinsServer'
import { ConfigurationSteps } from '../ConfigurationSteps/ConfigurationSteps'
import {
  StyledH1,
  StyledInstallationContainer,
  StyledInstallationContent,
} from '../ConnectJenkins.styles'
import {
  isFormValid,
  setName,
} from '../../../common/util/jenkinsConnectionsUtils'
import { ServerConfigurationFormName } from '../../JenkinsConfigurationForm/ServerConfigurationFormElements/ServerConfigurationFormName/ServerConfigurationFormName'
import { ConnectLogos } from '../ConnectLogos/ConnectLogos'
import { AnalyticsClient } from '../../../common/analytics/analytics-client'
import {
  AnalyticsEventTypes,
  AnalyticsOperationalEventsEnum,
  AnalyticsScreenEventsEnum,
  AnalyticsTrackEventsEnum,
  AnalyticsUiEventsEnum,
} from '../../../common/analytics/analytics-events'
import { generateNewSecret } from '../../../api/generateNewSecret'

const analyticsClient = new AnalyticsClient()
const validateUrlOrIp = (input: string): boolean => {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ) // fragment locator
  return !!urlPattern.test(input)
}

const CreateServer = () => {
  const history = useHistory()
  const [serverName, setServerName] = useState('')
  const [serverUrl, setServerUrl] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    analyticsClient.sendAnalytics(
      AnalyticsEventTypes.ScreenEvent,
      AnalyticsScreenEventsEnum.CreateJenkinsServerScreenName,
    )
  }, [])

  const onSubmitCreateServer = async () => {
    await analyticsClient.sendAnalytics(
      AnalyticsEventTypes.UiEvent,
      AnalyticsUiEventsEnum.CreateJenkinsServerName,
      {
        source: AnalyticsScreenEventsEnum.CreateJenkinsServerScreenName,
        action: 'clicked Create',
        actionSubject: 'button',
      },
    )

    if (!validateUrlOrIp(serverUrl)) {
      setHasError(true)
      setErrorMessage('Please enter a valid IP address or URL.')

      // Send analytics event for URL validation failure
      await analyticsClient.sendAnalytics(
        AnalyticsEventTypes.TrackEvent,
        AnalyticsOperationalEventsEnum.JenkinsServerUrlValidationFailure,
        {
          source: AnalyticsScreenEventsEnum.CreateJenkinsServerScreenName,
          action: 'submitted create server form with URL validation failure',
          actionSubject: 'input-validation',
        },
      )
      return
    }

    if (isFormValid(serverName, setHasError, setErrorMessage)) {
      setIsLoading(true)
      const uuid = uuidv4()

      try {
        await createJenkinsServer({
          name: serverName,
          uuid,
          secret: await generateNewSecret(),
          pipelines: [],
        })

        await analyticsClient.sendAnalytics(
          AnalyticsEventTypes.TrackEvent,
          AnalyticsTrackEventsEnum.CreatedJenkinsServerSuccessName,
          {
            source: AnalyticsScreenEventsEnum.CreateJenkinsServerScreenName,
            action: 'submitted create server form success',
            actionSubject: 'form',
          },
        )

        history.push(`/connect/${uuid}`)
      } catch (e) {
        console.error('Error: ', e)

        await analyticsClient.sendAnalytics(
          AnalyticsEventTypes.TrackEvent,
          AnalyticsTrackEventsEnum.CreatedJenkinsServerErrorName,
          {
            source: AnalyticsScreenEventsEnum.CreateJenkinsServerScreenName,
            action: 'submitted create server form error',
            actionSubject: 'form',
            error: e,
          },
        )

        setIsLoading(false)
      }
    }
  }

  return (
    <StyledInstallationContainer>
      <ConfigurationSteps currentStage={'create'} />
      <ConnectLogos />

      <StyledH1>Create your Jenkins Server</StyledH1>
      <StyledInstallationContent>
        <Form onSubmit={onSubmitCreateServer}>
          {({ formProps }: any) => (
            <form
              {...formProps}
              name="create-server-form"
              data-testid="createServerForm"
            >
              <ServerConfigurationFormName
                serverName={serverName}
                setServerName={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setName(event, setServerName)
                }
                hasError={hasError}
                errorMessage={errorMessage}
                setHasError={setHasError}
                serverNameHelperText={
                  'Enter a name for your server. You can change this at any time.'
                }
              />
              <Field name="serverUrl" label="Jenkins Server URL" isRequired>
                {({ fieldProps }: any) => (
                  <input
                    {...fieldProps}
                    type="text"
                    value={serverUrl}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setServerUrl(event.target.value)
                    }
                    placeholder="Enter Jenkins server URL or IP address"
                    className={hasError ? 'error' : ''}
                  />
                )}
              </Field>
              {hasError && <div className="error-message">{errorMessage}</div>}

              <FormFooter>
                {isLoading ? (
                  <LoadingButton
                    appearance="primary"
                    isLoading
                    className={loadingIcon}
                    testId="loading-button"
                  />
                ) : (
                  <Button
                    type="submit"
                    appearance="primary"
                    testId="submit-button"
                  >
                    Create
                  </Button>
                )}
              </FormFooter>
            </form>
          )}
        </Form>
      </StyledInstallationContent>
    </StyledInstallationContainer>
  )
}

export { CreateServer }
