import React, { memo } from 'react';
import { Alert, Card } from 'antd';
import { shell } from '../../../polyfills';
import { LinkOutlined, WarningOutlined } from '@ant-design/icons';
import styles from './Explanation.css';

/**
 *
 * @param {object} translation
 * @param {string} testReportUrl
 */
const Explanation = memo(({ translation, testReportUrl }) => {
  return (
    <Card
      title={
        <span>
          <WarningOutlined /> {translation('sauceExplanationImportant')}
        </span>
      }
      className={styles.innerExplanationContainer}
    >
      <div>
        <Alert
          message={translation('sauceExplanationInfo')}
          type="info"
          showIcon
        />
        <span className={styles.text}>
          {translation('sauceExplanationIssues')}
          <a
            href="#"
            onClick={(e) =>
              e.preventDefault() ||
              shell.openExternal(
                'https://github.com/saucelabs/appium-inspector-saucelabs/issues'
              )
            }
          >
            <LinkOutlined />
            &nbsp;
            {translation('sauceExplanationFileBug')}
          </a>
          {translation('sauceExplanationIssuesTwo')}
          <ul>
            <li>{translation('sauceExplanationIssuesList1')}</li>
            <li>{translation('sauceExplanationIssuesList2')}</li>
            <li>{translation('sauceExplanationIssuesList3')}</li>
            <li>{translation('sauceExplanationIssuesList4')}</li>
          </ul>
        </span>
        {testReportUrl && (
          <>
            <span className={styles.text}>
              {translation('sauceExplanationReportOne')}
              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault() || shell.openExternal(testReportUrl)
                }
              >
                <LinkOutlined />
                &nbsp;
                {translation('sauceExplanationReportUrl')}
              </a>
            </span>
            <span className={styles.text}>
              {translation('sauceExplanationReportTwo')}
            </span>
          </>
        )}
      </div>
    </Card>
  );
});

export default Explanation;
