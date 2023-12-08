import React from 'react';
import { cx } from '@emotion/css';
import PeopleGroup from '@atlaskit/icon/glyph/people-group';
import Button from '@atlaskit/button/standard-button';
import {
	setUpGuideInfoPanel,
	setUpGuideNestedOrderedList,
	setUpGuideNestedOrderedListItem,
	setUpGuideOrderedList,
	setUpGuideOrderedListItem,
	setUpGuideOrderListItemHeader,
	setUpGuideParagraph,
	setUpGuideUpdateAvailableButtonContainer,
	setUpGuideUpdateAvailableContent,
	setUpGuideUpdateAvailableHeader,
	setUpGuideUpdateAvailableIconContainer
} from './ConnectionPanel.styles';
import { JenkinsPluginConfig } from '../../../../src/common/types';
import { UpdateAvailableIcon } from '../icons/UpdateAvailableIcon';
import { InProductHelpAction, InProductHelpActionType } from '../InProductHelpDrawer/InProductHelpAction';

type UpdateAvailableProps = {
	openDrawer(): void
};

export const UpdateAvailable = ({ openDrawer }: UpdateAvailableProps): JSX.Element => {
	return (
		<>
			<UpdateAvailableIcon containerClassName={setUpGuideUpdateAvailableIconContainer} />
			<h3 className={cx(setUpGuideUpdateAvailableHeader)}>Update available</h3>
			<p className={cx(setUpGuideUpdateAvailableContent)}>This server is connected to Jira and sending data,
				but is using an outdated Atlassian Software Cloud plugin.</p>
			<p className={cx(setUpGuideUpdateAvailableContent)}>To access features like this set up guide,
				a Jenkins admin must log into this server and update the plugin.</p>
			<div className={cx(setUpGuideUpdateAvailableButtonContainer)}>
				<InProductHelpAction onClick={openDrawer} label="Learn more" type={InProductHelpActionType.HelpButton} appearance="primary" />
				{/* TODO - ARC-2738 */}
				<Button>Refresh</Button>
			</div>
		</>
	);
};

type SetUpGuidePipelineStepInstructionProps = {
	eventType: string,
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
	pipelineStepLabel: string
};

const SetUpGuidePipelineStepInstruction = ({
	eventType,
	onClick,
	pipelineStepLabel
}: SetUpGuidePipelineStepInstructionProps): JSX.Element => {
	return (
		<p>Add a &nbsp;
			<InProductHelpAction
				onClick={onClick}
				label={pipelineStepLabel}
				type={InProductHelpActionType.HelpLink}
				appearance="link"
			/>&nbsp;
			step to the end of {eventType} stages.
		</p>
	);
};

export enum PipelineEventType {
	BUILD = 'build',
	DEPLOYMENT = 'deployment'
}

type SetUpGuideInstructionsProps = {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
	eventType: PipelineEventType,
	globalSettings?: boolean,
	regex?: string
};

export const SetUpGuideInstructions = ({
	onClick,
	eventType,
	globalSettings,
	regex
}: SetUpGuideInstructionsProps): JSX.Element => {
	const pipelineStepLabel =
		eventType === PipelineEventType.BUILD
			? 'jiraSendBuildInfo'
			: 'jiraSendDeploymentInfo';

	let contentToRender;

	if (
		globalSettings &&
		((eventType === PipelineEventType.DEPLOYMENT) ||
			(eventType === PipelineEventType.BUILD && regex?.length))
	) {
		contentToRender = (
			<>
				<SetUpGuidePipelineStepInstruction
					eventType={eventType}
					onClick={onClick}
					pipelineStepLabel={pipelineStepLabel}
				/>
				<p>
					<strong>OR</strong>
				</p>
				<p>
					Use &nbsp;
					<InProductHelpAction
						onClick={onClick}
						label={regex || '<regex>'}
						type={InProductHelpActionType.HelpLink}
						appearance="link"
					/>
					&nbsp; in the names of the {eventType} stages.
				</p>
			</>
		);
	} else if (eventType === PipelineEventType.BUILD && globalSettings && !regex?.length) {
		contentToRender =
			<p>
				<InProductHelpAction onClick={onClick} label="No setup required" type={InProductHelpActionType.HelpLink} appearance="link" />
			</p>;
	} else {
		contentToRender = (
			<SetUpGuidePipelineStepInstruction
				eventType={eventType}
				onClick={onClick}
				pipelineStepLabel={pipelineStepLabel}
			/>
		);
	}

	return (
		<li className={cx(setUpGuideNestedOrderedListItem)}>
			Set up what {eventType} events are sent to Jira: {pipelineStepLabel}
			{contentToRender}
		</li>
	);
};

type SetUpGuideProps = {
	pluginConfig?: JenkinsPluginConfig,
	openDrawer(): void
};

const SetUpGuide = ({
	pluginConfig,
	openDrawer
}: SetUpGuideProps): JSX.Element => {
	return (
		<>
			<p className={cx(setUpGuideParagraph)}>To receive build and deployment data from this server:</p>

			<ol className={cx(setUpGuideOrderedList)}>
				<li className={cx(setUpGuideOrderedListItem)}>
					<strong className={cx(setUpGuideOrderListItemHeader)}>
								Developers in your project teams
					</strong>
					<p id="setup-step-one-instruction">Must enter their Jira issue keys
						(e.g. <InProductHelpAction onClick={openDrawer} label="JIRA-1234" type={InProductHelpActionType.HelpLink} appearance="link" />)
						into their branch names and commit message.
					</p>
				</li>

				<li className={cx(setUpGuideOrderedListItem)}><strong>The person setting up your Jenkinsfile</strong>
					<ol className={cx(setUpGuideNestedOrderedList)} type="A" id="nested-list">
						<SetUpGuideInstructions
							onClick={openDrawer}
							eventType={PipelineEventType.BUILD}
							globalSettings={pluginConfig?.autoBuildEnabled}
							regex={pluginConfig?.autoBuildRegex}
						/>
						<SetUpGuideInstructions
							onClick={openDrawer}
							eventType={PipelineEventType.DEPLOYMENT}
							globalSettings={pluginConfig?.autoDeploymentsEnabled}
							regex={pluginConfig?.autoDeploymentsRegex}
						/>
					</ol>
				</li>
			</ol>

			<div className={cx(setUpGuideInfoPanel)}>
				<PeopleGroup label="people-group" />
				<p>
					Not sure who should use this guide? It depends how your teams use Jenkins.&nbsp;
					<InProductHelpAction onClick={openDrawer} label="Here’s what you need to know." type={InProductHelpActionType.HelpLink} appearance="link" />
				</p>
			</div>
		</>
	);
};

export { SetUpGuide };
