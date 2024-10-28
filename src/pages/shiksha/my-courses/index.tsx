import React, {Fragment} from 'react'
import { routes,SHIKSHA_COURSES } from '@/constant';  
import {
  SEO,
  CardContainerB,
  LoadingSpinner,
  FlexContainer,
  Text,
  LinkButton,
} from '@/components';

function index() {
  return (
    <div>
      <CardContainerB
        id={routes.internals.landing.shiksha_courses}
        heading='Our'
        focusText='courses'
        cards={SHIKSHA_COURSES}
        borderColour={2}
      />
    </div>
  )
}

export default index
