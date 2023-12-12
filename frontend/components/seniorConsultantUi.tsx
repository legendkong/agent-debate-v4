import Balancer from 'react-wrap-balancer'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card'

import Image from 'next/image'

export function SeniorConsultantUI() {
  return (
    <div>
      <Card className='mb-2'>
        <CardHeader className='flex flex-row items-start'>
          <Image
            src='/SAPLeadConsultant.png'
            alt='SAP Lead Consultant Profile'
            width={40}
            height={40}
          />
          <CardTitle
            className={'text-violet-400 dark:text-violet-400  ml-3 pt-2'}
          >
            SAP Lead Consultant
          </CardTitle>
        </CardHeader>
        <CardContent className='text-sm'>
          <Balancer>
            Hey there! Please ask your consulting question and let our team
            handle the rest.
          </Balancer>
        </CardContent>
        {/* <CardFooter>
          <CardDescription className='w-full'>asdas</CardDescription>
        </CardFooter> */}
      </Card>
    </div>
  )
}
